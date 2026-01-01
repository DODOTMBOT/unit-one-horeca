import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function PartnerHub() {
  const session = await getServerSession(authOptions);
  
  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const userPermissions = (session?.user?.permissions || []).map(p => p.toLowerCase());

  const modules = [
    { name: "Менеджер офиса", info: "Управление ресурсами и штатом.", href: "/partner/office" },
    { name: "Журналы HACCP", info: "Контроль здоровья и температур.", href: "/partner/haccp" },
    { name: "Аналитика и мониторинг", info: "Отчеты и показатели.", href: "/partner/analytics" },
    { name: "База знаний", info: "Стандарты и инструкции.", href: "#", isSoon: true },
  ];

  // ИСПРАВЛЕНО: Гибкая фильтрация
  const visibleModules = modules.filter(module => {
    if (module.isSoon) return true;
    if (isSuperAdmin) return true;
    
    const targetPath = module.href.toLowerCase();
    return userPermissions.some(p => p === targetPath || p.startsWith(targetPath + "/"));
  });

  return (
    <div data-page="partner-terminal" className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex items-center justify-between mb-20">
          <div className="flex-1 hidden md:flex justify-start" />
          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none">Панель партнёра</h1>
          </div>
          <div className="flex-1 flex items-center justify-end gap-2">
            <Link href="/" className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50">
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Главная</p>
            </Link>
            <Link href="/profile" className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50">
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">
                {session?.user?.name || "Профиль"}
              </p>
            </Link>
            <Link href="/api/auth/signout" className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500">
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleModules.map((module, idx) => (
            <Link key={idx} href={module.href} className="no-underline">
              <div className={`group relative h-full min-h-[160px] p-8 rounded-[2rem] border transition-all ${
                module.isSoon ? "bg-slate-100/30 border-transparent opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-indigo-200"
              }`}>
                <h3 className={`text-xl font-black leading-tight mb-3 tracking-tight ${module.isSoon ? 'text-slate-400' : 'text-[#1e1b4b]'}`}>{module.name}</h3>
                <p className="text-[13px] font-medium text-slate-400 leading-relaxed group-hover:text-slate-500">{module.info}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}