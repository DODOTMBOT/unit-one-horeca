import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "ADMIN";
    const { pathname } = req.nextUrl;

    // 1. Защита админки
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Создаем ответ и прокидываем pathname в заголовки
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // 3. Отключаем кэширование для динамических зон
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Публичные страницы не требуют токена (например, главная)
        // Если путь не в матчере защиты, возвращаем true
        return !!token || !req.nextUrl.pathname.startsWith("/admin");
      },
    },
    pages: { signIn: "/auth/signin" }, // убедитесь, что путь к вашей странице входа верный
  }
)

export const config = { 
  // ВАЖНО: расширяем matcher, чтобы middleware видел все переходы для подсветки меню
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}