import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ShieldAlert } from 'lucide-react';

const SUPER_ADMIN_EMAIL = "ar.em.v@yandex.ru"; 

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  const userRole = (user?.role || "").toUpperCase();
  
  const isSuperUser = 
    userRole === "ADMIN" || 
    userRole === "OWNER" || 
    user?.email === SUPER_ADMIN_EMAIL;

  const hasDynamicAccess = user?.permissions?.some((p: string) => 
    p === "/admin" || p.startsWith("/admin/")
  );

  const hasAccess = isSuperUser || hasDynamicAccess;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
           <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Доступ ограничен</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Учетная запись <span className="font-semibold">{user?.email}</span> не имеет прав для доступа к панели администратора.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-[#1F2937] text-white rounded-full font-medium hover:bg-black transition-colors"
        >
          Вернуться назад
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}