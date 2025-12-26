import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, LayoutDashboard } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-[1200px] px-6 pt-10">
        
        {/* ХЕДЕР С ГРАДИЕНТНЫМ АКЦЕНТОМ */}
        <header className="sticky top-6 z-40 mb-12 flex h-20 items-center justify-between rounded-full border border-white bg-white/70 px-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e1b4b] to-[#4338ca] text-white shadow-lg shadow-indigo-900/20">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Панель управления</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Сессия: <span className="text-indigo-500">{session.user?.email}</span>
              </p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="group flex items-center gap-2 rounded-full bg-[#1e1b4b] px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            <Globe size={14} />
            На сайт
          </Link>
        </header>

        {/* СЕТКА С ЦВЕТОВЫМИ АКЦЕНТАМИ */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* ТОВАРЫ - СИНИЙ */}
          <Link 
            href="/admin/products"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Товары
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-blue-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Каталог, цены и управление решениями
              </p>
            </div>
          </Link>

          {/* ПОЛЬЗОВАТЕЛИ - ФИОЛЕТОВЫЙ */}
          <Link 
            href="/admin/users"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Клиенты
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-purple-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                База пользователей и права доступа
              </p>
            </div>
          </Link>

          {/* МАРКЕТИНГ - ОРАНЖЕВЫЙ */}
          <Link 
            href="/admin/banners"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/5 blur-2xl transition-all group-hover:bg-orange-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Промо
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-orange-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Баннеры и акции на главной странице
              </p>
            </div>
          </Link>

          {/* ЗАКАЗЫ - ЗЕЛЕНЫЙ */}
          <Link 
            href="/admin/orders"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all group-hover:bg-emerald-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Заказы
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-emerald-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Транзакции и статусы оплаты
              </p>
            </div>
          </Link>

          {/* АНАЛИТИКА - СЕРЫЙ / В РАЗРАБОТКЕ */}
          <div className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-dashed border-slate-200 bg-slate-50 p-10 opacity-70 transition-all">
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-400">
                Отчеты
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-slate-200" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-300 uppercase tracking-widest italic">
                Скоро: графики продаж и метрики
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}