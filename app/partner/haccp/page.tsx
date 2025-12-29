"use client";

import { LogOut, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PartnerHACCPPage() {
  const { data: session } = useSession() as any;
  
  const haccpModules = [
    { 
      name: "Журнал здоровья", 
      info: "Допуск персонала: контроль состояния здоровья сотрудников перед сменой.", 
      href: "/partner/haccp/health",
      isActive: true 
    },
    { 
      name: "Температуры", 
      info: "Холодильники и склады: ведение журналов мониторинга температурного режима.", 
      href: "/partner/haccp/temperature",
      isActive: true 
    },
    { 
      name: "Фритюрные жиры", 
      info: "Учет замены масла: контроль качества фритюра и соблюдение регламентов.", 
      href: "#",
      isActive: false
    },
    { 
      name: "Бракераж", 
      info: "Качество готовых блюд: органолептическая оценка продукции перед реализацией.", 
      href: "#",
      isActive: false
    }
  ];

  return (
    <div 
      data-page="partner-terminal" 
      className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12"
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP INTERFACE BAR */}
        <header className="flex items-center justify-between mb-20">
          
          {/* ЛЕВАЯ ЧАСТЬ: КНОПКА НАЗАД */}
          <div className="flex-1 flex justify-start">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 flex items-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Панель партнёра</p>
            </Link>
          </div>

          {/* ЦЕНТРАЛЬНЫЙ БЛОК */}
          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:block shadow-sm">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Журналы HACCP
            </h1>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 shadow-sm flex items-center gap-3"
            >
              <Home size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Главная</p>
            </Link>

            <Link 
              href="/" 
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors shadow-sm"
              title="Выйти"
            >
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        {/* MODULES GRID (Идентично PartnerHub) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {haccpModules.map((module, idx) => {
            const isActive = module.isActive;
            
            const CardContent = (
              <div className={`group relative h-full min-h-[160px] p-8 rounded-[2rem] border transition-colors ${
                !isActive 
                ? "bg-slate-100/30 border-transparent opacity-40 cursor-not-allowed" 
                : "bg-white border-slate-100 hover:border-indigo-200"
              }`}>
                <div>
                  <h3 className={`text-xl font-black leading-tight mb-3 tracking-tight ${!isActive ? 'text-slate-400' : 'text-[#1e1b4b]'}`}>
                    {module.name}
                  </h3>
                  <p className="text-[13px] font-medium text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                    {module.info}
                  </p>
                </div>

                {!isActive && (
                  <div className="mt-auto pt-4">
                     <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-full">
                       В разработке
                     </div>
                  </div>
                )}
              </div>
            );

            return isActive ? (
              <Link key={idx} href={module.href} className="no-underline">
                {CardContent}
              </Link>
            ) : (
              <div key={idx}>{CardContent}</div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-32 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="opacity-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Unit One Ecosystem v.2.4</p>
          </div>
          <div className="flex gap-12">
            {["Поддержка", "Регламенты", "API"].map((item) => (
              <span key={item} className="text-[10px] font-black uppercase tracking-widest text-slate-200 hover:text-indigo-600 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}