import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ArrowLeft, 
  Home, 
  LayoutGrid, 
  ArrowUpRight, 
  ShieldCheck, 
  Thermometer, 
  Activity, 
  Droplet, 
  Utensils 
} from "lucide-react";
import Link from "next/link";

// Маппинг иконок для HACCP
const getIcon = (href: string) => {
  if (href.includes('health')) return Activity;
  if (href.includes('temperature')) return Thermometer;
  if (href.includes('fryer')) return Droplet;
  if (href.includes('quality')) return Utensils;
  return ShieldCheck;
};

export default async function PartnerHACCPPage() {
  const session = await getServerSession(authOptions);
  
  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const userPermissions = (session?.user?.permissions || []).map(p => p.toLowerCase());
  
  const haccpModules = [
    { 
      name: "ЖУРНАЛ ЗДОРОВЬЯ", 
      subtitle: "HEALTH LOG",
      info: "КОНТРОЛЬ СОСТОЯНИЯ СОТРУДНИКОВ ПЕРЕД СМЕНОЙ.", 
      href: "/partner/haccp/health",
      isActive: true 
    },
    { 
      name: "ТЕМПЕРАТУРЫ", 
      subtitle: "TEMPERATURE MONITORING",
      info: "ВЕДЕНИЕ ЖУРНАЛОВ МОНИТОРИНГА ТЕМПЕРАТУРНОГО РЕЖИМА.", 
      href: "/partner/haccp/temperature",
      isActive: true 
    },
    { 
      name: "ФРИТЮРНЫЕ ЖИРЫ", 
      subtitle: "COOKING OIL CONTROL",
      info: "УЧЕТ ЗАМЕНЫ МАСЛА И СОБЛЮДЕНИЕ РЕГЛАМЕНТОВ.", 
      href: "/partner/haccp/fryer",
      isActive: false
    },
    { 
      name: "БРАКЕРАЖ", 
      subtitle: "FOOD QUALITY ASSESSMENT",
      info: "ОРГАНОЛЕПТИЧЕСКАЯ ОЦЕНКА ГОТОВОЙ ПРОДУКЦИИ.", 
      href: "/partner/haccp/quality",
      isActive: false
    }
  ];

  const visibleModules = haccpModules.filter(module => {
    if (!module.isActive) return true;
    if (isSuperAdmin) return true;
    return userPermissions.includes(module.href.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="flex items-center gap-5">
          <Link href="/partner" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight uppercase">
              Журналы HACCP
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-widest">
              СИСТЕМА ПИЩЕВОЙ БЕЗОПАСНОСТИ
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end pb-2">
          <span className="text-4xl font-light text-[#111827]">{haccpModules.filter(m => m.isActive).length}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">АКТИВНО</span>
        </div>
      </div>

      {/* MODULES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleModules.map((module, idx) => {
          const isActive = module.isActive;
          const Icon = getIcon(module.href);
          
          const CardContent = (
            <div className={`relative h-72 p-8 bg-white rounded-[2.5rem] shadow-soft border border-transparent flex flex-col justify-between transition-all duration-300 ${
              !isActive 
              ? "opacity-50 grayscale" 
              : "hover:shadow-xl hover:border-[#10b981]"
            }`}>
              
              {/* TOP PART */}
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center transition-colors duration-300 ${isActive && 'group-hover:bg-[#10b981] group-hover:text-white'}`}>
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

              {/* BOTTOM PART */}
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
            <Link key={idx} href={module.href} className="no-underline group">
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
          <LayoutGrid size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Unit One Ecosystem v.2.4</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Food Safety Control</span>
        </div>
      </footer>
    </div>
  );
}