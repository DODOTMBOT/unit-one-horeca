"use client";

import { useSession } from "next-auth/react";
import { Loader2, ChevronLeft, ArrowUpRight, Globe, Compass, Shield, Users, Megaphone, Settings, Lock } from "lucide-react";
import Link from "next/link";

// Хелпер для иконок разделов
const getIcon = (href: string) => {
  if (href.includes('directions')) return Globe;
  if (href.includes('navigation')) return Compass;
  if (href.includes('roles')) return Shield;
  if (href.includes('users')) return Users;
  if (href.includes('promos')) return Megaphone;
  return Settings;
};

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
        { name: "Пользователи", href: "/admin/settings/users/list" },
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
  // Приводим permissions к нижнему регистру для надежности, если они есть
  const userPermissions = (session?.user?.permissions || []).map((p: string) => p.toLowerCase());

  const accessibleLinks = sections.flatMap(section => 
    section.links
      .filter(link => {
        if (isSuperAdmin) return true;
        // Простая проверка прав (можно усложнить)
        return userPermissions.some((p: string) => link.href.toLowerCase().includes(p));
      })
      .map(link => ({ ...link, sectionDescription: section.description }))
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#10b981]" size={32} />
      </div>
    );
  }

  if (accessibleLinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <Lock size={24} />
        </div>
        <h1 className="text-xl font-bold text-[#111827]">Доступ к настройкам ограничен</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Для вашей роли <span className="font-semibold text-[#10b981]">{session?.user?.role || "Пользователь"}</span> не активированы модули настроек.
        </p>
        <Link 
          href="/admin" 
          className="mt-6 px-6 py-2.5 bg-[#1F2937] text-white rounded-full text-sm font-bold hover:bg-black transition-colors"
        >
          Вернуться в панель
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight">
            Настройки
          </h1>
          <p className="text-gray-500 font-medium mt-2 ml-1">
            Конфигурация сайта и доступов
          </p>
        </div>
        
        {/* Кнопка Назад */}
        <Link 
          href="/admin"
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:text-[#10b981] hover:border-[#10b981]/30 transition-all shadow-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Назад</span>
        </Link>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessibleLinks.map((link, idx) => {
          const Icon = getIcon(link.href);
          
          return (
            <Link key={idx} href={link.href} className="no-underline group">
              <div className="relative h-64 p-8 bg-white rounded-[2.5rem] shadow-soft hover:shadow-xl border border-transparent hover:border-[#10b981] flex flex-col justify-between transition-all duration-300">
                
                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-white transition-colors duration-300">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-black group-hover:text-black transition-all">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                {/* BOTTOM */}
                <div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2 group-hover:translate-x-1 transition-transform">
                    {link.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[90%] uppercase tracking-wide">
                    {link.sectionDescription}
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