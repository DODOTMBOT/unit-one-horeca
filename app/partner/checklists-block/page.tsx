import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ArrowLeft, 
  LayoutGrid, 
  ArrowUpRight, 
  ClipboardList, 
  UserPlus, 
  FileSearch, 
  PlusCircle,
  Settings2
} from "lucide-react";
import Link from "next/link";

// Маппинг иконок
const getIcon = (name: string) => {
  if (name === 'СОЗДАТЬ') return PlusCircle;
  if (name === 'НАЗНАЧИТЬ') return UserPlus;
  if (name === 'ОТЧЕТЫ') return FileSearch;
  return ClipboardList;
};

export default async function PartnerChecklistsMainPage() {
  const session = await getServerSession(authOptions);
  
  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const userPermissions = (session?.user?.permissions || []).map(p => p.toLowerCase());
  
  const checklistModules = [
    { 
      name: "СОЗДАТЬ", 
      subtitle: "CREATE TEMPLATE",
      info: "КОНСТРУКТОР НОВЫХ ШАБЛОНОВ И ПУНКТОВ ПРОВЕРКИ.", 
      href: "/partner/checklists/new", 
      isActive: true 
    },
    { 
      name: "НАЗНАЧИТЬ", 
      subtitle: "ASSIGN TASKS",
      info: "РАСПРЕДЕЛЕНИЕ ЗАДАЧ МЕЖДУ СОТРУДНИКАМИ И ТОЧКАМИ.", 
      href: "/partner/checklists/assign", 
      isActive: true 
    },
    { 
      name: "ОТЧЕТЫ", 
      subtitle: "REPORTS JOURNAL",
      info: "ПРОСМОТР ЗАВЕРШЕННЫХ ПРОВЕРОК И ФОТО-ФИКСАЦИИ.", 
      href: "/partner/checklists/reports",
      isActive: true 
    },
    { 
      name: "АРХИВ", 
      subtitle: "ARCHIVE STORAGE",
      info: "АРХИВ УДАЛЕННЫХ И НЕАКТУАЛЬНЫХ ШАБЛОНОВ.", 
      href: "/partner/checklists/archive",
      isActive: false
    }
  ];

  const visibleModules = checklistModules.filter(module => {
    if (!module.isActive) return true;
    if (isSuperAdmin) return true;
    return userPermissions.includes(module.href.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="flex items-center gap-5">
          <Link href="/partner" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight uppercase">
              Чек-листы
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-widest">
              КОНТРОЛЬ СТАНДАРТОВ UNIT ONE
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end pb-2">
          <span className="text-4xl font-light text-[#111827]">{checklistModules.filter(m => m.isActive).length}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">АКТИВНО</span>
        </div>
      </div>

      {/* MODULES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleModules.map((module, idx) => {
          const isActive = module.isActive;
          const Icon = getIcon(module.name);
          
          const CardContent = (
            <div className={`relative h-72 p-8 bg-white rounded-[2.5rem] shadow-soft border border-transparent flex flex-col justify-between transition-all duration-300 ${
              !isActive 
              ? "opacity-50 grayscale" 
              : "hover:shadow-xl hover:border-indigo-600 group cursor-pointer"
            }`}>
              
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center transition-colors duration-300 ${isActive && 'group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  <Icon size={24} />
                </div>
                
                {isActive ? (
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-black group-hover:text-black transition-all">
                      <ArrowUpRight size={18} />
                  </div>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                      СКОРО
                  </span>
                )}
              </div>

              <div>
                <h3 className={`text-xl font-bold text-[#111827] mb-1 uppercase ${isActive && 'group-hover:translate-x-1 transition-transform'}`}>
                  {module.name}
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  {module.subtitle}
                </p>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed uppercase">
                  {module.info}
                </p>
              </div>
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

      {/* FOOTER BLOCK */}
      <footer className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center opacity-30">
        <div className="flex items-center gap-3">
          <Settings2 size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Unit One Ecosystem v.2.4</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quality Management</span>
        </div>
      </footer>
    </div>
  );
}