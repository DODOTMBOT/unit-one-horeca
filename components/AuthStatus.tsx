"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, LogOut, Loader2 } from "lucide-react";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Ждем монтирования, чтобы клиент перекрыл серверный кэш Safari
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    // Показываем пустой скелетон или прозрачную заглушку
    return <div className="w-[120px] h-10 bg-slate-50 animate-pulse rounded-full" />;
  }

  if (status === "unauthenticated") {
    return (
      <Link 
        href="/api/auth/signin" 
        className="px-6 py-3 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link 
        href="/profile" 
        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
      >
        <User size={14} />
        Мой профиль
      </Link>
      
      {/* Кнопка выхода для тестов, чтобы сбросить сессию */}
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
        title="Выйти"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}