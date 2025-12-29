import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileDashboard from "@/components/ProfileDashboard";
import { User, ShieldCheck, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const email = session.user?.email || "";
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      orders: {
        where: { isPaid: true },
        include: { 
          items: {
            include: {
              product: {
                include: {
                  materials: true,
                  category: true 
                }
              }
            }
          } 
        },
        orderBy: { createdAt: 'desc' }
      },
      establishments: true, 
      ownedEstablishments: true,
      parentPartner: true,
    }
  });

  if (!user) {
     redirect("/");
  }

  const isPartner = user.role === "PARTNER";

  return (
    <div 
      // Атрибут для скрытия глобального Header (аналогично PartnerHub)
      data-page="partner-terminal" 
      className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12"
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP INTERFACE BAR */}
        <header className="flex items-center justify-between mb-20">
          
          {/* ЛЕВАЯ ЧАСТЬ: КНОПКА НАЗАД */}
          <div className="flex-1 flex justify-start">
            <Link 
              href="/partner/office" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-all hover:bg-slate-50 flex items-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">В менеджер</p>
            </Link>
          </div>

          {/* ЦЕНТРАЛЬНЫЙ БЛОК (ДАННЫЕ ПОЛЬЗОВАТЕЛЯ) */}
          <div className="px-12 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:flex flex-col items-center shadow-sm">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none mb-1 text-center">
              Профиль: {user.name} {user.surname}
            </h1>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</span>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-1">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: КНОПКА ПАНЕЛЬ */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 shadow-sm flex items-center gap-3"
            >
              <Home size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Панель</p>
            </Link>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main className="max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
           <ProfileDashboard user={user as any} orders={user.orders as any} />
        </main>

        {/* FOOTER */}
        <footer className="mt-32 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8 opacity-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">
              Unit One Ecosystem v.2.4 • {user.role} Access
            </p>
        </footer>
      </div>
    </div>
  );
}