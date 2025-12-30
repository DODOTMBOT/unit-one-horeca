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

  // 1. ПРОВЕРКИ РОЛЕЙ
  const isSuperAdmin = 
    session?.user?.role === "ADMIN" || 
    session?.user?.role === "OWNER" || 
    session?.user?.email === 'ar.em.v@yandex.ru';

  const hasAnyAdminAccess = session?.user?.permissions?.some((p: string) => 
    p.startsWith("/admin")
  );

  const showAdminButton = isSuperAdmin || hasAnyAdminAccess;
  const isPartner = session?.user?.role === "PARTNER";

  const canSeeOrders = isSuperAdmin || session?.user?.permissions?.includes("/admin/orders");
  
  const { data: countData } = useSWR(canSeeOrders ? "/api/admin/orders/count" : null, fetcher, {
    refreshInterval: 30000, 
  });

  const ordersCount = countData?.count || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return <div className="w-10 h-10 bg-white border border-slate-100 animate-pulse rounded-full" />;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Link 
        href="/api/auth/signin" 
        className="px-6 py-2.5 bg-[#1e1b4b] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#7171a7] transition-all"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      
      {/* Иконка ЗАКАЗЫ */}
      {canSeeOrders && ordersCount > 0 && (
        <Link
          href="/admin/orders"
          title="Новые заказы"
          className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 transition-all hover:border-emerald-500 hover:text-emerald-500"
        >
          <ShoppingBag size={18} strokeWidth={2} className={ordersCount > 0 ? "animate-pulse" : ""} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
            {ordersCount > 9 ? '9+' : ordersCount}
          </span>
        </Link>
      )}

      {/* КНОПКА ПАРТНЕРА */}
      {isPartner && (
        <Link 
          href="/partner" 
          className="group flex items-center gap-3 pl-4 pr-5 py-2 bg-white border border-slate-100 rounded-full hover:border-indigo-400 transition-all"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:text-indigo-500 transition-all">
            <LayoutDashboard size={14} strokeWidth={2} />
          </div>
          <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-[#1e1b4b]">
            Партнёр
          </span>
        </Link>
      )}

      {/* Иконка АДМИН */}
      {showAdminButton && (
        <Link 
          href="/admin" 
          title="Панель администратора"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 transition-all hover:border-[#7171a7] hover:text-[#7171a7]"
        >
          <ShieldCheck size={18} strokeWidth={2} />
        </Link>
      )}

      {/* Мой профиль */}
      <Link 
        href="/profile" 
        className="group flex items-center gap-3 pl-4 pr-5 py-2 bg-white border border-slate-100 rounded-full transition-all hover:border-[#7171a7]"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:text-[#7171a7] transition-colors">
          <User size={14} strokeWidth={2} />
        </div>
        <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-[#1e1b4b]">
          Профиль
        </span>
        <ChevronRight size={10} className="text-slate-300 group-hover:text-[#7171a7] group-hover:translate-x-0.5 transition-all" />
      </Link>

      {/* Кнопка ВЫХОД */}
      <button 
        onClick={() => signOut()}
        title="Выйти"
        className="flex h-10 w-10 items-center justify-center text-slate-200 hover:text-rose-500 transition-colors"
      >
        <LogOut size={18} strokeWidth={2} />
      </button>
    </div>
  );
}