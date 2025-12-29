import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileDashboard from "@/components/ProfileDashboard";
import { ShieldCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        where: { isPaid: true },
        include: { 
          items: {
            include: {
              product: {
                include: { materials: true, category: true }
              }
            }
          } 
        },
        orderBy: { createdAt: 'desc' }
      },
      establishment: true, 
      ownedEstablishments: true,
      parentPartner: true,
    }
  });

  if (!user) notFound();

  const isPartner = user.role === "PARTNER";

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 pt-8">
        
        <header className="sticky top-4 z-40 mb-8 flex h-16 items-center justify-between rounded-full border border-white bg-white/80 px-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-4">
            {/* Заменили на Link, чтобы избежать ошибок с BackButton и JavaScript URL */}
            <Link 
              href="/partner/establishments" 
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all"
            >
               <ChevronLeft size={16} />
            </Link>
            
            <div className="flex flex-col leading-none">
                <h1 className="text-sm font-black uppercase tracking-tighter text-[#1e1b4b]">
                  {user.name} {user.surname}
                </h1>
                <span className="text-[10px] font-bold text-slate-400">
                  {isPartner ? 'Партнер' : 'Сотрудник'} • {user.email}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
             <ShieldCheck size={12} className="text-emerald-500" />
             <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
          </div>
        </header>

        <main>
           <ProfileDashboard user={user} orders={user.orders as any} />
        </main>
      </div>
    </div>
  );
}