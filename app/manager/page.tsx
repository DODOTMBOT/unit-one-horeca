import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  HeartPulse, Store, ArrowLeft, 
  ClipboardList, Users, Settings2, 
  ChevronRight, LayoutGrid, LucideIcon
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Добавляем интерфейсы
interface ManagerLink {
  name: string;
  href: string;
  icon: LucideIcon;
  info?: string;
  badge?: string;
}

interface ManagerSection {
  title: string;
  description: string;
  links: ManagerLink[];
}

export default async function ManagerHub() {
  const session = await getServerSession(authOptions);
  
if (!session?.user?.role || !["MANAGER", "PARTNER", "OWNER"].includes(session.user.role as string)) {
      redirect("/");
  }

  const establishments = await prisma.establishment.findMany({
    where: {
      employees: { some: { id: session.user.id } }
    },
    select: { id: true, name: true }
  });

  const sections: ManagerSection[] = [
    {
      title: "Контроль ХАССП",
      description: "Журналы здоровья и операционные проверки",
      links: [
        { name: "Журнал здоровья", href: "/manager/haccp", icon: HeartPulse, info: "Ежедневно" },
        { name: "Чек-листы", href: "#", icon: ClipboardList, badge: "Soon" },
      ]
    },
    {
      title: "Моя команда",
      description: "Просмотр списка сотрудников смены",
      links: [
        { name: "Персонал", href: "#", icon: Users, info: "Просмотр" },
      ]
    },
    {
      title: "Настройки",
      description: "Личные данные и уведомления",
      links: [
        { name: "Профиль", href: "/profile", icon: Settings2 },
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
               <div className="h-[1px] w-8 bg-emerald-600" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
                 Manager Terminal
               </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Рабочий стол
            </h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Доступ к объектам</p>
                <div className="flex items-center gap-2">
                   <Store size={12} className="text-emerald-500" />
                   <span className="text-[11px] font-black uppercase tracking-tight">
                     {establishments.length} {establishments.length === 1 ? 'точка' : 'точки'}
                   </span>
                </div>
             </div>
             <Link href="/" className="group flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-600 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600">Выход</span>
                <ArrowLeft size={16} className="text-slate-300 group-hover:text-emerald-600" />
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
                    className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <link.icon size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" strokeWidth={1.5} />
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
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
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
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
                 HACCP Terminal • Manager Access
               </p>
            </div>
        </footer>
      </div>
    </div>
  );
}