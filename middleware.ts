import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const { pathname, origin } = req.nextUrl;

    // 1. ПУБЛИЧНЫЕ СТРАНИЦЫ
    if (
      pathname.startsWith("/auth") || 
      pathname === "/denied" || 
      pathname === "/"
    ) {
      return NextResponse.next();
    }

    // 2. СУПЕР-АДМИН (OWNER/ADMIN)
    const isSuperAdmin = 
      token?.role === "ADMIN" || 
      token?.role === "OWNER" || 
      token?.email === process.env.SUPER_ADMIN_EMAIL;
      
    if (isSuperAdmin) return NextResponse.next();

    // 3. ПРОВЕРКА ДОСТУПА ПО БАЗЕ
    const currentPath = pathname.toLowerCase();

    if (currentPath.startsWith("/admin") || currentPath.startsWith("/partner")) {
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      
      const normalizedPath = currentPath
        .replace(uuidRegex, '[id]')
        .replace(/\/$/, "") || "/";

      // ЛОГИКА НАСЛЕДОВАНИЯ:
      // Если путь содержит [id], мы также проверим доступ к родительской папке.
      // Например: для /partner/office/establishments/[id] 
      // родитель будет /partner/office/establishments
      const parentPath = normalizedPath.includes('/[id]') 
        ? normalizedPath.split('/[id]')[0] 
        : null;

      try {
        const checkRes = await fetch(`${origin}/api/auth/check-permission`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            roleId: token?.roleId, 
            path: normalizedPath,
            parentPath: parentPath // Передаем родителя для облегчения проверки в API
          }),
        });

        const { hasAccess } = await checkRes.json();

        if (!hasAccess) {
          console.log(`❌ ACCESS DENIED: ${normalizedPath} (Parent: ${parentPath}) for roleId: ${token?.roleId}`);
          return NextResponse.rewrite(new URL("/denied", req.url));
        }
      } catch (error) {
        console.error("Middleware Auth Error:", error);
        return NextResponse.next(); 
      }
    }

    // 4. ПРОКИДЫВАНИЕ ЗАГОЛОВКОВ
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    
    if (pathname.startsWith("/admin") || pathname.startsWith("/partner")) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/auth") || pathname === "/denied" || pathname === "/") {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = { 
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] 
};