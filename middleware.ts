import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 1. Исключаем саму страницу "Доступ запрещен" из проверок, чтобы не войти в бесконечный цикл
    if (pathname === "/denied") {
      return NextResponse.next();
    }

    // 2. Определяем супер-права
    const isSuperAdmin = 
      token?.role === "ADMIN" || 
      token?.role === "OWNER" || 
      token?.email === process.env.SUPER_ADMIN_EMAIL;

    // Если супер-админ — разрешаем всё сразу
    if (isSuperAdmin) return NextResponse.next();

    // 3. СТРОГАЯ ПРОВЕРКА ПУТЕЙ ДЛЯ ОСТАЛЬНЫХ РОЛЕЙ
    const userPermissions = (token?.permissions as string[]) || [];

    // Защищаем разделы /admin и /partner
    if (pathname.startsWith("/admin") || pathname.startsWith("/partner")) {
      
      // Проверяем прямое наличие пути в массиве разрешений
      const hasDirectAccess = userPermissions.includes(pathname);

      if (!hasDirectAccess) {
        // Вместо главной страницы отправляем на специальную страницу с ошибкой
        const url = new URL("/denied", req.url);
        // Добавляем в URL информацию, куда именно не пустили (для отладки или красоты)
        url.searchParams.set("from", pathname); 
        return NextResponse.redirect(url);
      }
    }

    // 4. Формируем стандартный ответ с пробросом pathname в заголовки
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // 5. Отключаем кэширование для приватных зон
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin") || pathname.startsWith("/partner")) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }

    return response;
  },
  {
    callbacks: {
      // Пользователь должен быть авторизован для доступа к любому маршруту, кроме логина
      authorized: ({ token }) => !!token,
    },
    pages: { 
      signIn: "/auth/login",
    }, 
  }
)

export const config = { 
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