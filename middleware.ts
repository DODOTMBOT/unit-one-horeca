import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Страница "Доступ запрещен" и Auth всегда открыты
    if (pathname === "/denied" || pathname.startsWith("/auth")) {
      return NextResponse.next();
    }

    // 1. Супер-админы (OWNER / ADMIN) ходят везде
    const isSuperAdmin = token?.role === "ADMIN" || token?.role === "OWNER" || token?.email === process.env.SUPER_ADMIN_EMAIL;
    if (isSuperAdmin) return NextResponse.next();

    // Получаем права пользователя (приводим к нижнему регистру)
    const userPermissions = (token?.permissions as string[] || []).map(p => p.toLowerCase());
    const currentPath = pathname.toLowerCase();

    // 2. ЗАЩИТА РАЗДЕЛОВ /admin и /partner
    if (currentPath.startsWith("/admin") || currentPath.startsWith("/partner")) {
      
      const hasAccess = userPermissions.some(permission => {
        // Базовая проверка: путь должен начинаться с разрешения
        if (!currentPath.startsWith(permission)) return false;

        // ==============================================================
        // ФИЗИЧЕСКАЯ ЗАЩИТА ОТ "НАСЛЕДОВАНИЯ" (FIX)
        // ==============================================================
        
        // Разбиваем пути на сегменты (части между слэшами)
        // Пример: /partner/office/staff -> 3 сегмента
        const pathSegments = currentPath.split('/').filter(Boolean);
        const permSegments = permission.split('/').filter(Boolean);

        // Если это точное совпадение (например, идем в Офис и имеем права на Офис) -> ПУСКАЕМ
        if (currentPath === permission) return true;

        // Если путь длиннее разрешения (пытаемся зайти глубже), проверяем глубину.
        // В вашей системе "Модули" находятся на 3-м уровне вложенности:
        // 1. /partner
        // 2. /partner/office
        // 3. /partner/office/staff (МОДУЛЬ)
        
        // ПРАВИЛО: Разрешение уровня 1 или 2 НЕ МОЖЕТ открывать уровень 3.
        // Если у нас право "/partner/office" (2 сегмента), а мы ломимся в "/partner/office/staff" (3 сегмента) -> БЛОК.
        if (permSegments.length < 3 && pathSegments.length >= 3) {
           return false;
        }

        // Если разрешение уже уровня 3 (/partner/office/staff), оно может открывать что угодно внутри себя
        // Например: /partner/office/staff/add (4 сегмента) -> БУДЕТ ОТКРЫТО
        
        return true;
      });

      if (!hasAccess) {
        // Если прав нет — редирект на страницу ошибки
        return NextResponse.rewrite(new URL("/denied", req.url));
      }
    }

    // Стандартные заголовки
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
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/auth/login" },
  }
);

export const config = { 
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] 
};