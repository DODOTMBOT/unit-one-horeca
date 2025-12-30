import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

const SUPER_ADMIN_EMAIL = "ar.em.v@yandex.ru"; 

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  const userRole = (user?.role || "").toUpperCase();
  
  // 1. Проверяем супер-права (старая логика)
  const isSuperUser = 
    userRole === "ADMIN" || 
    userRole === "OWNER" || 
    user?.email === SUPER_ADMIN_EMAIL;

  // 2. Проверяем динамические права (новая логика)
  // Если в массиве прав есть хотя бы корень "/admin", значит вход разрешен
  const hasDynamicAccess = user?.permissions?.some((p: string) => 
    p === "/admin" || p.startsWith("/admin/")
  );

  // Итоговое решение по доступу
  const hasAccess = isSuperUser || hasDynamicAccess;

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-black font-sans">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
             <span className="text-6xl filter drop-shadow-lg">🚫</span>
          </div>
          <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">Доступ запрещен</h1>
          <p className="mb-8 text-neutral-500 text-sm leading-relaxed">
            Аккаунт <span className="font-bold text-indigo-600">{user?.email || "гостя"}</span> не имеет прав администратора для доступа к этой системе.
          </p>
          <Link 
            href="/" 
            className="block w-full rounded-2xl bg-[#1e1b4b] py-5 font-black text-white uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}