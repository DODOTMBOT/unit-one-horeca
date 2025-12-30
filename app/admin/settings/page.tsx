"use client";

import { useSession } from "next-auth/react";
import { LogOut, Lock, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsHub() {
  const { data: session, status } = useSession();

  const sections = [
    {
      title: "Экосистемы",
      description: "Настройка экосистем и направлений платформы.",
      links: [
        { name: "Экосистемы", href: "/admin/settings/directions" },
      ]
    },
    {
      title: "Навигация",
      description: "Настройка главного и второстепенного меню.",
      links: [
        { name: "Навигация", href: "/admin/settings/navigation" },
      ]
    },
    {
      title: "Роли и доступы",
      description: "Управление ролями и правами пользователей.",
      links: [
        { name: "Роли и доступы", href: "/admin/settings/roles" },
      ]
    },

        {
      title: "Пользователи",
      description: "Список пользователей.",
      links: [
        { name: "Пользователи", href: "/admin/users/list" },
      ]
    },

    {
      title: "Промо-материалы",
      description: "Управление баннерами и акциями на главной.",
      links: [
        { name: "Промо-баннеры", href: "/admin/promos" },
      ]
    }
  ];

  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const userPermissions = session?.user?.permissions || [];

  const accessibleLinks = sections.flatMap(section => 
    section.links
      .filter(link => isSuperAdmin || userPermissions.includes(link.href))
      .map(link => ({ ...link, sectionDescription: section.description }))
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (accessibleLinks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <Lock size={40} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800 mb-2">Доступы не настроены</h1>
        <p className="text-slate-400 text-sm max-w-sm mb-8 font-medium">
          Для роли <span className="text-indigo-600 font-bold">{session?.user?.roleName}</span> не активированы модули настроек.
        </p>
        <Link href="/" className="px-8 py-4 bg-[#1e1b4b] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER С КНОПКОЙ НАЗАД */}
        <div className="flex items-center justify-between mb-20">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/admin" 
              className="group flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Настройки сайта
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-2">
            <Link href="/" className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-colors">
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Сайт</p>
            </Link>
            <Link href="/api/auth/signout" className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </Link>
          </div>
        </div>

        {/* GRID: 4 КОЛОНКИ В РЯД, МИНИМАЛИЗМ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessibleLinks.map((link, idx) => (
            <Link key={idx} href={link.href} className="no-underline">
              <div className="group relative h-full min-h-[180px] p-8 rounded-[2.5rem] border border-slate-100 bg-white transition-all duration-300 hover:border-[#7171a7]">
                <h3 className="text-lg font-black leading-tight mb-3 tracking-tight text-[#1e1b4b]">
                  {link.name}
                </h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed opacity-60">
                  {link.sectionDescription}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-32 pt-10 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
               Конфигурация системы: {session?.user?.roleName}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}