"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, LayoutDashboard, Loader2 } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  // Получаем количество заказов для бейджа
  const { data: countData } = useSWR("/api/admin/orders/count", fetcher, {
    refreshInterval: 30000, 
  });

  const newOrdersCount = countData?.count || 0;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!session) redirect("/api/auth/signin");

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-[1200px] px-6 pt-10">
        
        {/* ХЕДЕР */}
        <header className="sticky top-6 z-40 mb-12 flex h-20 items-center justify-between rounded-full border border-white bg-white/70 px-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1b4b] text-white">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Панель управления</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Администратор: <span className="text-indigo-500">{session.user?.email}</span>
              </p>
            </div>
          </div>
          
          <Link href="/" className="flex items-center gap-2 rounded-full bg-[#1e1b4b] px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-600 shadow-lg">
            <Globe size={14} /> На сайт
          </Link>
        </header>

        {/* ПОЛНАЯ СЕТКА ВСЕХ БЛОКОВ (БЕЗ ИКОНОК) */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* ПОДПИСКИ - ЯНТАРНЫЙ */}
          <Link href="/admin/subscriptions" className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Подписки</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-amber-500 transition-all group-hover:w-32" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
              Управление тарифами и автосписаниями
            </p>
          </Link>

          {/* НАВИГАЦИЯ - ЦИАН */}
          <Link href="/admin/menu" className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Навигация</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-cyan-500 transition-all group-hover:w-32" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
              Управление ссылками верхнего меню
            </p>
          </Link>

          {/* ЗАКАЗЫ - ЭМЕРАЛЬД */}
          <Link href="/admin/orders" className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
            {newOrdersCount > 0 && (
              <div className="absolute right-10 top-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[12px] font-black text-white shadow-lg animate-bounce">
                {newOrdersCount}
              </div>
            )}
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Заказы</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-emerald-500 transition-all group-hover:w-32" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
              Транзакции и статусы оплаты
            </p>
          </Link>

          {/* ТОВАРЫ - СИНИЙ */}
          <Link href="/admin/products" className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Товары</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-blue-500 transition-all group-hover:w-32" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
              Каталог, цены и управление решениями
            </p>
          </Link>

          {/* ЭКОСИСТЕМА - ИНДИГО */}
          <Link href="/admin/directions" className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Экосистема</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-indigo-500 transition-all group-hover:w-20" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
              Направления главной и логотипы
            </p>
          </Link>

          {/* КЛИЕНТЫ - ФИОЛЕТОВЫЙ */}
          <Link href="/admin/users" className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Клиенты</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-purple-500 transition-all group-hover:w-32" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
              База пользователей и права доступа
            </p>
          </Link>

          {/* ПРОМО - ОРАНЖЕВЫЙ */}
          <Link href="/admin/banners" className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Промо</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-orange-500 transition-all group-hover:w-32" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
              Баннеры и акции на главной странице
            </p>
          </Link>

          {/* АНАЛИТИКА - СЕРЫЙ / В РАЗРАБОТКЕ */}
          <div className="group relative flex min-h-[220px] flex-col justify-center rounded-[45px] border border-dashed border-slate-200 bg-slate-50 p-10 opacity-70 transition-all">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-300">Отчеты</h2>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-slate-200" />
            <p className="mt-6 text-[10px] font-bold leading-relaxed text-slate-300 uppercase tracking-widest italic">
              Скоро: графики продаж и метрики
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}