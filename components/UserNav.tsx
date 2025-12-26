"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, ShieldCheck, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserNav() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return <div className="w-32 h-10 bg-slate-50 animate-pulse rounded-full" />;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Link 
        href="/api/auth/signin" 
        className="px-6 py-3 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-[#1e1b4b] hover:bg-[#1e1b4b] hover:text-white transition-all duration-500 shadow-sm"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Кнопка админа: теперь это стильный бейдж */}
      {session.user.role === "ADMIN" && (
        <Link 
          href="/admin" 
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50/50 border border-red-100 rounded-full text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500"
        >
          <ShieldCheck size={12} strokeWidth={3} />
          Админ
        </Link>
      )}

      {/* Мой профиль: легкий, премиальный дизайн */}
      <Link 
        href="/profile" 
        className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-indigo-900/5 hover:border-indigo-100 transition-all duration-500"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-[#1e1b4b] group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500">
          <User size={14} strokeWidth={2.5} />
        </div>
        
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1e1b4b]">
          Профиль
        </span>
        
        <ChevronRight size={12} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
      </Link>
    </div>
  );
}