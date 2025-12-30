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

  return (
    <div 
      // Атрибут для скрытия глобального Header
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
              className="group flex h-12 px-8 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <ArrowLeft size={16} className="text-slate-400 group-hover:text-[#7171a7] transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none">В менеджер</span>
              </div>
            </Link>
          </div>

          {/* ЦЕНТРАЛЬНЫЙ БЛОК (ДАННЫЕ ПОЛЬЗОВАТЕЛЯ) */}
          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:flex flex-col items-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800 leading-none mb-2 text-center">
              Личный кабинет
            </h1>
            <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{user.email}</span>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Активен</span>
                </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: КНОПКА ПАНЕЛЬ */}
          <div className="flex-1 flex items-center justify-end">
            <Link 
              href="/partner" 
              className="group flex h-12 px-8 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-all hover:border-[#7171a7]"
            >
              <div className="flex items-center gap-3">
                <Home size={16} className="text-slate-400 group-hover:text-[#7171a7] transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none">Панель</span>
              </div>
            </Link>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main className="max-w-[1000px] mx-auto transition-all duration-500">
           {/* Обертка для Dashboard, чтобы он соответствовал стилю, если там есть карточки */}
           <div className="hover:border-[#7171a7] transition-colors">
              <ProfileDashboard user={user as any} orders={user.orders as any} />
           </div>
        </main>

        {/* FOOTER */}
        <footer className="mt-32 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8 opacity-20">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
              Unit One Ecosystem v.2.4 • Profile Terminal
            </p>
            <div className="flex gap-4 items-center">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Система активна</span>
            </div>
        </footer>
      </div>
    </div>
  );
}