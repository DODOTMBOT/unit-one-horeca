import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Building2, Users, Settings2, ArrowLeft,
  Zap, Star, ArrowRight, ClipboardList,
  UserPlus, BarChart3, MapPin, LucideIcon,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";

interface PartnerLink {
  name: string;
  href: string;
  icon: LucideIcon;
  info?: string;
  badge?: string;
}

interface PartnerSection {
  title: string;
  description: string;
  links: PartnerLink[];
}

export default async function PartnerHub() {
  const session = await getServerSession(authOptions);
  
  const estCount = await prisma.establishment.count({
    where: { ownerId: session?.user.id }
  });

  const staffCount = await prisma.user.count({
    where: { partnerId: session?.user.id }
  });

  const sections: PartnerSection[] = [
    {
      title: "Управление сетью",
      description: "Операционный контроль ваших объектов",
      links: [
        { name: "Список точек", href: "/partner/establishments", icon: Building2, info: `${estCount} заведений` },
        { name: "География", href: "/partner/establishments", icon: MapPin },
      ]
    },
    {
      title: "Человеческий капитал",
      description: "Управление персоналом и доступами",
      links: [
        { name: "Команда", href: "/partner/staff", icon: Users, info: `${staffCount} сотрудников` },
        { name: "Приглашения", href: "/profile", icon: UserPlus },
      ]
    },
    {
      title: "Эффективность",
      description: "Аналитические данные и контроль",
      links: [
        { name: "Чек-листы", href: "#", icon: ClipboardList, badge: "Soon" },
        { name: "Отчетность", href: "#", icon: BarChart3, badge: "Soon" },
      ]
    },
    {
      title: "Аккаунт",
      description: "Конфигурация профиля партнера",
      links: [
        { name: "Настройки", href: "/profile", icon: Settings2 },
        { name: "Безопасность", href: "/profile", icon: Zap },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans text-[#1e1b4b]">
      <div className="max-w-[1100px] mx-auto px-6 pt-16">
        
        {/* HEADER */}
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="h-[1px] w-8 bg-indigo-600" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
                 Management Interface
               </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Partner Hub
            </h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                   <Star size={12} className="text-amber-500 fill-amber-500" />
                   <span className="text-[11px] font-black uppercase tracking-tight">Premium Business</span>
                </div>
             </div>
             <Link href="/" className="group flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Back</span>
                <ArrowLeft size={16} className="text-slate-300 group-hover:text-indigo-600" />
             </Link>
          </div>
        </header>

        {/* SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {sections.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black uppercase tracking-tight mb-1">
                  {section.title}
                </h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.description}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {section.links.map((link, lIdx) => (
                  <Link 
                    key={lIdx} 
                    href={link.href}
                    className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <link.icon size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" strokeWidth={1.5} />
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                          {link.name}
                        </span>
                        {link.info && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                            {link.info}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {link.badge && (
                        <span className="text-[8px] font-black text-slate-300 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {link.badge}
                        </span>
                      )}
                      <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <LayoutGrid size={14} className="text-slate-300" />
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                 Unit One Ecosystem • Partner Terminal
               </p>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
              v 2.4.0
            </p>
        </footer>
      </div>
    </div>
  );
}