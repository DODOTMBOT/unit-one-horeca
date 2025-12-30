"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function DeniedPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
        <ShieldX size={48} />
      </div>
      
      <h1 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b] mb-4">
        Уровень доступа: Недостаточный
      </h1>
      
      <p className="text-slate-400 text-sm max-w-md text-center mb-10 font-medium leading-relaxed">
        Ваша текущая роль не имеет разрешений на просмотр этого ресурса. 
        Если это ошибка — обратитесь к системному администратору.
      </p>

      <Link 
        href="/" 
        className="flex items-center gap-3 px-10 py-5 bg-[#1e1b4b] text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl shadow-indigo-200"
      >
        <ArrowLeft size={16} />
        Вернуться в безопасную зону
      </Link>
    </div>
  );
}