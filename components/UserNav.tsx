"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, ShieldCheck, ChevronRight, ShoppingBag, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserNav() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Проверки ролей
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === 'ar.em.v@yandex.ru';
  const isPartner = session?.user?.role === "PARTNER";

  // Получаем количество заказов (только для админа)
  const { data: countData } = useSWR(isAdmin ? "/api/admin/orders/count" : null, fetcher, {
    refreshInterval: 30000, 
  });

  const ordersCount = countData?.count || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return <div className="w-10 h-10 bg-slate-50 animate-pulse rounded-full" />;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Link 
        href="/api/auth/signin" 
        className="px-6 py-2.5 bg-[#1e1b4b] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-lg shadow-indigo-900/20"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      
      {/* Иконка ЗАКАЗЫ: видна только админу */}
      {isAdmin && ordersCount > 0 && (
        <Link
          href="/admin/orders/list"
          title="Новые заказы"
          className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50/50 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white shadow-sm"
        >
          <ShoppingBag size={18} strokeWidth={2.5} className={ordersCount > 0 ? "animate-pulse" : ""} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[9px] font-black text-white shadow-sm transition-transform group-hover:scale-110">
            {ordersCount > 9 ? '9+' : ordersCount}
          </span>
        </Link>
      )}

      {/* КНОПКА ПАРТНЕРА: Теперь в полном виде с текстом */}
      {isPartner && (
        <Link 
          href="/partner" 
          className="group flex items-center gap-3 pl-4 pr-5 py-2 bg-indigo-50/50 border border-indigo-100 rounded-full shadow-sm hover:shadow-md hover:bg-indigo-600 hover:text-white transition-all duration-300"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-indigo-600 group-hover:bg-white group-hover:scale-110 transition-all">
            <LayoutDashboard size={14} strokeWidth={2.5} />
          </div>
          <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:text-white">
            Панель партнёра
          </span>
        </Link>
      )}

      {/* Иконка АДМИН: компактный круг */}
      {isAdmin && (
        <Link 
          href="/admin" 
          title="Панель администратора"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-red-50/50 text-red-500 transition-all hover:bg-red-500 hover:text-white shadow-sm"
        >
          <ShieldCheck size={18} strokeWidth={2.5} />
        </Link>
      )}

      {/* Мой профиль */}
      <Link 
        href="/profile" 
        className="group flex items-center gap-3 pl-4 pr-5 py-2 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-[#1e1b4b] group-hover:bg-indigo-500 group-hover:text-white transition-colors">
          <User size={14} strokeWidth={2.5} />
        </div>
        <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#1e1b4b]">
          Профиль
        </span>
        <ChevronRight size={10} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
      </Link>

      {/* Кнопка ВЫХОД */}
      <button 
        onClick={() => signOut()}
        title="Выйти"
        className="flex h-10 w-10 items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
      >
        <LogOut size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}