import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Управление товарами</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Каталог и настройки</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Режим редактора</span>
          </div>
        </header>

        {/* СЕТКА БЛОКОВ */}
        <div className="grid gap-8 sm:grid-cols-2">
          
          {/* Блок 1: Добавить продукт - ФИОЛЕТОВЫЙ */}
          <Link 
            href="/admin/products/create"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition-all group-hover:bg-indigo-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Добавить продукт
              </h2>
              <div className="mt-2 h-1.5 w-12 rounded-full bg-indigo-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Создание новой карточки, загрузка фото и цен
              </p>
            </div>
          </Link>

          {/* Блок 2: Редакция каталога - СИНИЙ */}
          <Link 
            href="/admin/products/manage"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Редакция каталога
              </h2>
              <div className="mt-2 h-1.5 w-12 rounded-full bg-blue-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Управление всеми товарами и их удаление
              </p>
            </div>
          </Link>

          {/* Блок 3: Категории - РОЗОВЫЙ */}
          <Link 
            href="/admin/products/categories"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-pink-500/5 blur-2xl transition-all group-hover:bg-pink-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Категории
              </h2>
              <div className="mt-2 h-1.5 w-12 rounded-full bg-pink-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Группировка решений и их структура
              </p>
            </div>
          </Link>

          {/* Блок 4: Типы продукта - БИРЮЗОВЫЙ */}
          <Link 
            href="/admin/types"
            className="group relative flex min-h-[200px] flex-col justify-end rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl transition-all group-hover:bg-cyan-500/20" />
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                Типы продуктов
              </h2>
              <div className="mt-2 h-1.5 w-12 rounded-full bg-cyan-500 transition-all group-hover:w-20" />
              <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400 uppercase tracking-widest">
                Настройка форматов и материалов
              </p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}