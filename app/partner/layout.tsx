import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ShieldAlert } from 'lucide-react';

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  const userRole = (user?.role || "").toUpperCase();
  
  const isAuthorizedRole = 
    userRole === "PARTNER" || 
    userRole === "OWNER" || 
    userRole === "ADMIN";

  const hasDynamicAccess = user?.permissions?.some((p: string) => 
    p === "/partner" || p.startsWith("/partner/")
  );

  const hasAccess = isAuthorizedRole || hasDynamicAccess;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-[#F3F4F6]">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
           <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Доступ ограничен</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Учетная запись <span className="font-semibold text-gray-700">{user?.email || "Гость"}</span> не имеет прав для доступа к партнерской панели.
        </p>
        <Link 
          href="/" 
          className="px-8 py-3 bg-[#111827] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
        >
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] selection:bg-[#10b981]/20">
      {/* pt-28 необходим, чтобы контент не перекрывался парящим хедером из RootLayout */}
      <main className="max-w-[1400px] mx-auto pt-28 p-6 lg:p-12">
        {children}
      </main>
    </div>
  );
}