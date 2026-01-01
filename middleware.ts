import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname === "/denied" || pathname.startsWith("/auth")) {
      return NextResponse.next();
    }

    const isSuperAdmin = 
      token?.role === "ADMIN" || 
      token?.role === "OWNER" || 
      token?.email === process.env.SUPER_ADMIN_EMAIL;
      
    if (isSuperAdmin) return NextResponse.next();

    const userPermissions = (token?.permissions as string[] || []).map(p => p.toLowerCase());
    const currentPath = pathname.toLowerCase();

    if (currentPath.startsWith("/admin") || currentPath.startsWith("/partner")) {
      
      // --- ЛОГИКА ДЛЯ ДИНАМИЧЕСКИХ ПУТЕЙ (UUID) ---
      // Регулярка для поиска UUID: /partner/establishments/ID/module -> /partner/establishments/module
      const uuidRegex = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const normalizedPath = currentPath.replace(uuidRegex, "");

      const hasAccess = userPermissions.some(permission => {
        const p = permission.toLowerCase();

        // Проверяем либо прямое совпадение с текущим путем, либо с нормализованным (без ID)
        const isBaseMatch = currentPath.startsWith(p) || normalizedPath.startsWith(p);
        
        if (!isBaseMatch) return false;

        // --- ЗАЩИТА ОТ НАСЛЕДОВАНИЯ ---
        const pathSegments = currentPath.split('/').filter(Boolean);
        const permSegments = p.split('/').filter(Boolean);

        // Если это динамический путь (с ID), сегментов будет больше. 
        // В этом случае мы ориентируемся на нормализованный путь для проверки глубины.
        const checkSegments = uuidRegex.test(currentPath) 
          ? normalizedPath.split('/').filter(Boolean) 
          : pathSegments;

        // Если пытаемся зайти на уровень 3 (/partner/office/staff), а имеем только уровень 2 (/partner/office)
        if (permSegments.length < 3 && checkSegments.length >= 3) {
           return false;
        }
        
        return true;
      });

      if (!hasAccess) {
        return NextResponse.rewrite(new URL("/denied", req.url));
      }
    }

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
        if (pathname.startsWith("/auth") || pathname === "/denied") return true;
        return !!token;
      },
    },
    pages: { signIn: "/auth/login" },
  }
);

export const config = { 
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] 
};