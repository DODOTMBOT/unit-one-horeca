"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-all hover:bg-slate-50 flex items-center gap-3 group shadow-sm w-fit"
    >
      <ArrowLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Назад</p>
    </button>
  );
}