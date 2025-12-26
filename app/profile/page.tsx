import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileDashboard from "@/components/ProfileDashboard";
import { User, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
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
      }
    }
  });

  if (!user) {
     redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 pt-8">
        
        {/* ХЕДЕР: Компактный и "стеклянный" */}
        <header className="sticky top-4 z-40 mb-8 flex h-16 items-center justify-between rounded-full border border-white bg-white/80 px-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-white hover:text-indigo-600 transition-all border border-slate-100 shadow-sm">
               <ChevronRight size={16} className="rotate-180" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e1b4b] text-white shadow-lg shadow-indigo-900/10">
                <User size={16} />
              </div>
              <div className="flex flex-col leading-none">
                <h1 className="text-sm font-black uppercase tracking-tighter text-[#1e1b4b]">
                  Личный кабинет
                </h1>
                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px] sm:max-w-none">
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
             <ShieldCheck size={12} className="text-emerald-500" />
             <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <ProfileDashboard user={user} orders={user.orders as any} />
        </main>

        {/* ФУТЕР КАБИНЕТА: Исправлены закрывающие теги */}
        <footer className="mt-12 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">
              HoReCa Solutions • Secure Access
            </p>
        </footer>
      </div>
    </div>
  );
}