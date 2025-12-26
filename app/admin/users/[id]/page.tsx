import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileDashboard from "@/components/ProfileDashboard";
import { ChevronLeft, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

// Типы ролей для корректного отображения
const ROLE_MAP: Record<string, string> = {
  ADMIN: "Администратор",
  USER: "Пользователь",
  MANAGER: "Менеджер"
};

export default async function AdminUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Распаковываем params (обязательно для Next.js 15)
  const { id } = await params;

  if (!id) return notFound();

  // 2. Загружаем пользователя с ролью
  const user = await prisma.user.findUnique({
    where: { id },
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
    notFound();
  }

  // Определяем подпись роли
  const userRoleLabel = ROLE_MAP[user.role] || user.role;
  const isAdminUser = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-[900px] mx-auto px-6 pt-10">
        
        {/* ХЕДЕР */}
        <header className="sticky top-6 z-40 mb-12 flex h-20 items-center justify-between rounded-full border border-slate-100 bg-white/80 px-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-5">
            <Link 
              href="/admin/orders" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 hover:bg-white transition-all shadow-sm group"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-indigo-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">
                Карточка клиента
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* БЕЙДЖ РОЛИ (Исправлено) */}
          <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border ${
            isAdminUser 
              ? "bg-purple-50 border-purple-100 text-purple-600" 
              : "bg-slate-50 border-slate-100 text-slate-500"
          }`}>
             {isAdminUser ? <ShieldCheck size={14} /> : <User size={14} />}
             <span className="text-[9px] font-black uppercase tracking-widest">
               {userRoleLabel}
             </span>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ 
          Мы передаем prop 'isAdminView={true}', чтобы внутри компонента 
          можно было скрыть слайдер покупок и показать их иначе.
        */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
<ProfileDashboard 
  user={user as any} 
  orders={user.orders as any} 
  isAdminView={true} 
/>
        </main>
      </div>
    </div>
  );
}