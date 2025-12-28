import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Building2, Users, Settings2, ArrowLeft,
  Zap, Star, ArrowRight, ClipboardList,
  UserPlus, BarChart3, MapPin, LucideIcon,
  LayoutGrid, Activity, ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface PartnerLink {
  name: string;
  href: string;
  icon: LucideIcon;
  info?: string;
  badge?: string;
  isSoon?: boolean;
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
      title: "Операционное управление",
      description: "Контроль объектов и их географии",
      links: [
        { name: "Мои заведения", href: "/partner/establishments", icon: Building2, info: `${estCount} объектов в сети` },
        { name: "Карта локаций", href: "/partner/establishments", icon: MapPin, info: "География присутствия" },
      ]
    },
    {
      title: "Санитарный контроль",
      description: "Стандарты HACCP и чек-листы",
      links: [
        { name: "Журналы здоровья", href: "/partner/haccp", icon: Activity, info: "Цифровой учет HACCP" },
        { name: "Чек-листы", href: "#", icon: ClipboardList, badge: "В разработке", isSoon: true },
        { name: "Аналитика рисков", href: "#", icon: BarChart3, badge: "Soon", isSoon: true },
      ]
    },
    {
      title: "HR & Ресурсы",
      description: "Управление персоналом сети",
      links: [
        { name: "Общий штат", href: "/partner/staff", icon: Users, info: `${staffCount} активных сотрудников` },
        { name: "Управление доступами", href: "/profile", icon: UserPlus, info: "Приглашения и роли" },
      ]
    },
    {
      title: "Конфигурация",
      description: "Настройки профиля и безопасности",
      links: [
        { name: "Профиль партнера", href: "/profile", icon: Settings2, info: "Личные данные и реквизиты" },
        { name: "Безопасность", href: "/profile", icon: Zap, info: "Пароли и сессии" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans text-[#1e1b4b]">
      <div className="max-w-[1100px] mx-auto px-6 pt-16">
        
        {/* HEADER */}
        <header className="mb-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <ShieldCheck size={14} className="text-indigo-600" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
                 Partner Control Panel
               </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Partner Hub
            </h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex flex-col items-end">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                   <Star size={10} className="text-indigo-600 fill-indigo-600" />
                   <span className="text-[10px] font-black uppercase text-indigo-600 tracking-tight">Premium Business</span>
                </div>
             </div>
             <Link href="/" className="group flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 hover:shadow-lg transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Exit</span>
                <ArrowLeft size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:-translate-x-1 transition-all" />
             </Link>
          </div>
        </header>

        {/* SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-800">
                    {section.title}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {section.description}
                  </p>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-200" />
              </div>

              <div className="flex flex-col gap-3">
                {section.links.map((link, lIdx) => {
                  const Content = (
                    <div className={`group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] transition-all duration-300 ${link.isSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-900/5'}`}>
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-2xl transition-colors ${link.isSoon ? 'bg-slate-50' : 'bg-slate-50 group-hover:bg-indigo-50'}`}>
                          <link.icon size={20} className={`${link.isSoon ? 'text-slate-300' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[11px] font-black uppercase tracking-tight ${link.isSoon ? 'text-slate-400' : 'text-slate-700 group-hover:text-indigo-600'} transition-colors`}>
                            {link.name}
                          </span>
                          {link.info && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                              {link.info}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {link.badge && (
                          <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">
                            {link.badge}
                          </span>
                        )}
                        {!link.isSoon && <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />}
                      </div>
                    </div>
                  );

                  return link.isSoon ? (
                    <div key={lIdx}>{Content}</div>
                  ) : (
                    <Link key={lIdx} href={link.href}>
                      {Content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <LayoutGrid size={14} className="text-white" />
               </div>
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                 Unit One Ecosystem <span className="mx-2 text-slate-200">|</span> Partner Hub Terminal
               </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                Service Engine v 2.4.0
              </p>
              <div className="h-1 w-1 rounded-full bg-emerald-400" />
            </div>
        </footer>
      </div>
    </div>
  );
}