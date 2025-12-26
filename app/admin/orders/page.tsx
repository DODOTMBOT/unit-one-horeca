import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, LayoutGrid } from "lucide-react";

export default async function ProductsHubPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-[1200px] px-6 pt-10">
        
        {/* ХЕДЕР В ЕДИНОМ СТИЛЕ */}
        <header className="sticky top-6 z-40 mb-12 flex h-20 items-center justify-between rounded-full border border-white bg-white/70 px-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin" 
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm hover:scale-110 transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-indigo-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Управление каталогом</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Товары и атрибуты</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Система активна</span>
          </div>
        </header>

        {/* СЕТКА БЛОКОВ */}
        <div className="grid gap-8 sm:grid-cols-2">
          
          {/* Блок 1: Заказы*/}
          <Link 
            href="/admin/orders/list"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition-all group-hover:bg-indigo-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Заказы
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-indigo-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Список всех заказов, статусы и управление
              </p>
            </div>
          </Link>


        </div>
      </div>
    </div>
  );
}