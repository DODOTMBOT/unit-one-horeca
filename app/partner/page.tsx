"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  LogOut, 
  Lock, 
  Loader2, 
  Building2, 
  ClipboardCheck, 
  BarChart3, 
  BookOpen, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";

// МАППИНГ ИКОНОК ДЛЯ ПАРТНЕРСКИХ МОДУЛЕЙ
const getIcon = (path: string) => {
  if (path.includes('office')) return Building2;
  if (path.includes('haccp')) return ClipboardCheck;
  if (path.includes('analytics')) return BarChart3;
  return BookOpen;
};

export default function PartnerHub() {
  const { data: session, status } = useSession();

  const modules = [
    { 
      name: "МЕНЕДЖЕР ОФИСА", 
      info: "УПРАВЛЕНИЕ РЕСУРСАМИ, ШТАТОМ И ОПЕРАЦИОННОЙ ДЕЯТЕЛЬНОСТЬЮ.", 
      href: "/partner/office" 
    },
    { 
      name: "ЖУРНАЛЫ HACCP", 
      info: "ЦИФРОВОЙ КОНТРОЛЬ ЗДОРОВЬЯ СОТРУДНИКОВ И ТЕМПЕРАТУРНЫХ РЕЖИМОВ.", 
      href: "/partner/haccp" 
    },
    { 
      name: "АНАЛИТИКА", 
      info: "МОНИТОРИНГ КЛЮЧЕВЫХ ПОКАЗАТЕЛЕЙ И ГЕНЕРАЦИЯ ОТЧЕТОВ.", 
      href: "/partner/analytics" 
    },
    { 
      name: "БАЗА ЗНАНИЙ", 
      info: "КОРПОРАТИВНЫЕ СТАНДАРТЫ, РЕГЛАМЕНТЫ И ИНСТРУКЦИИ.", 
      href: "#", 
      isSoon: true 
    },
  ];

  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const userPermissions = (session?.user?.permissions || []).map(p => p.toLowerCase());

  const visibleModules = modules.filter(module => {
    if (module.isSoon) return true;
    if (isSuperAdmin) return true;
    
    const targetPath = module.href.toLowerCase();
    return userPermissions.some(p => p === targetPath || p.startsWith(targetPath + "/"));
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="animate-spin text-[#10b981]" size={32} />
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">ЗАГРУЗКА ПАНЕЛИ...</p>
      </div>
    );
  }

  if (visibleModules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center uppercase">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <Lock size={24} />
        </div>
        <h1 className="text-xl font-bold text-[#111827] tracking-tight">НЕТ ДОСТУПНЫХ МОДУЛЕЙ</h1>
        <p className="text-gray-500 mt-2 text-[10px] font-bold tracking-widest">ОБРАТИТЕСЬ К АДМИНИСТРАТОРУ ДЛЯ ПОЛУЧЕНИЯ ПРАВ.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 uppercase">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tighter">
            ПАНЕЛЬ ПАРТНЁРА
          </h1>
          <p className="text-gray-400 font-bold mt-2 ml-1 text-[10px] tracking-[0.2em]">
            УПРАВЛЕНИЕ ПАРТНЕРСКИМИ СЕРВИСАМИ
          </p>
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-600 hover:text-red-500 hover:border-red-100 transition-all shadow-sm group tracking-widest"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>ВЫЙТИ</span>
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleModules.map((module, idx) => {
          const Icon = getIcon(module.href);
          
          return (
            <Link 
              key={idx} 
              href={module.href} 
              className={`no-underline group ${module.isSoon ? 'pointer-events-none' : ''}`}
            >
              <div className={`relative h-64 p-8 bg-white rounded-[2.5rem] shadow-soft border border-transparent flex flex-col justify-between transition-all duration-300 ${
                module.isSoon 
                ? 'opacity-50 grayscale' 
                : 'hover:shadow-xl hover:border-[#10b981]'
              }`}>
                
                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center transition-colors duration-300 ${!module.isSoon && 'group-hover:bg-[#10b981] group-hover:text-white'}`}>
                    <Icon size={24} />
                  </div>
                  
                  {!module.isSoon ? (
                    <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-black group-hover:text-black transition-all">
                        <ArrowUpRight size={18} />
                    </div>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                        СКОРО
                    </span>
                  )}
                </div>

                {/* BOTTOM */}
                <div>
                  <h3 className={`text-xl font-bold text-[#111827] mb-2 tracking-tight ${!module.isSoon && 'group-hover:translate-x-1'} transition-transform`}>
                    {module.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed max-w-[90%] tracking-widest">
                    {module.info}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}