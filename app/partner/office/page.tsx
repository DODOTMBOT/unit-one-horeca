import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogOut, ArrowLeft, Users, Building2, HardDrive, BookOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";

// МАППИНГ ИКОНОК ДЛЯ МОДУЛЕЙ ОФИСА
const getIcon = (name: string) => {
  switch (name) {
    case "Сотрудники": return Users;
    case "Рестораны": return Building2;
    case "Оборудование": return HardDrive;
    default: return BookOpen;
  }
};

export default async function PartnerOfficeHub() {
  const session = await getServerSession(authOptions);
  
  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const userPermissions = (session?.user?.permissions || []).map(p => p.trim().toLowerCase());

  const modules = [
    { 
      name: "СОТРУДНИКИ", 
      info: "УПРАВЛЕНИЕ ШТАТОМ И РОЛЯМИ", 
      href: "/partner/office/staff" 
    },
        { 
      name: "РОЛИ И ПРАВА", 
      info: "УПРАВЛЕНИЕ ДОСТУПАМИ СОТРУДНИКОВ", 
      href: "/partner/office/roles" 
    },
    { 
      name: "РЕСТОРАНЫ", 
      info: "РЕДАКТИРОВАНИЕ И СОЗДАНИЕ ОБЪЕКТОВ", 
      href: "/partner/office/establishments" 
    },
    { 
      name: "ОБОРУДОВАНИЕ", 
      info: "УПРАВЛЕНИЕ ТЕХНИЧЕСКИМ ПАРКОМ", 
      href: "/partner/office/equipment" 
    },
    { name: "БАЗА ЗНАНИЙ", info: "СТАНДАРТЫ И ИНСТРУКЦИИ", href: "#", isSoon: true },
  ];

  const visibleModules = modules.filter(module => {
    if (module.isSoon) return true;
    if (isSuperAdmin) return true;
    return userPermissions.includes(module.href.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-10 uppercase">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="flex items-center gap-5">
          <Link href="/partner" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tighter">
              МЕНЕДЖЕР ОФИСА
            </h1>
            <p className="text-gray-400 font-bold mt-2 ml-1 text-[10px] tracking-[0.2em]">
              ОПЕРАЦИОННОЕ УПРАВЛЕНИЕ РЕСУРСАМИ
            </p>
          </div>
        </div>
      </div>

      {/* GRID КАРТОЧЕК */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleModules.map((module, idx) => {
          const Icon = getIcon(module.name === "СОТРУДНИКИ" ? "Сотрудники" : module.name === "РЕСТОРАНЫ" ? "Рестораны" : module.name === "ОБОРУДОВАНИЕ" ? "Оборудование" : "default");
          const isSoon = module.isSoon;
          
          return (
            <Link 
              key={idx} 
              href={module.href} 
              className={`no-underline group ${isSoon ? 'pointer-events-none' : ''}`}
            >
              <div className={`relative h-72 p-8 bg-white rounded-[2.5rem] shadow-soft border border-transparent flex flex-col justify-between transition-all duration-300 ${
                isSoon 
                ? 'opacity-50 grayscale' 
                : 'hover:shadow-xl hover:border-[#10b981]'
              }`}>
                
                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center transition-colors duration-300 ${!isSoon && 'group-hover:bg-[#10b981] group-hover:text-white'}`}>
                    <Icon size={24} />
                  </div>
                  
                  {!isSoon ? (
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
                  <h3 className={`text-xl font-bold text-[#111827] mb-2 tracking-tight ${!isSoon && 'group-hover:translate-x-1'} transition-transform`}>
                    {module.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed tracking-widest uppercase">
                    {module.info}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* DEBUG INFO */}
      <div className="mt-10 p-6 bg-white border border-dashed border-gray-200 rounded-[2rem] opacity-50 hover:opacity-100 transition-opacity uppercase">
        <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">DEBUG INFO</p>
        <div className="text-[11px] font-mono text-gray-500 space-y-1 lowercase">
          <p>РОЛЬ: {session?.user?.role}</p>
          <p>АКТИВНЫЕ ПРАВА: {userPermissions.join(', ')}</p>
        </div>
      </div>
    </div>
  );
}