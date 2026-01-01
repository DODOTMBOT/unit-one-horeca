"use client";

import { useSession, signOut } from "next-auth/react"; 
import { LogOut, Lock, Loader2, Settings, ShoppingBag, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";

// Маппинг иконок для админки
const getIcon = (path: string) => {
  if (path.includes('settings')) return Settings;
  if (path.includes('products')) return ShoppingBag;
  if (path.includes('haccp')) return FileText;
  return Lock;
};

export default function AdminHub() {
  const { data: session, status } = useSession();

  const sections = [
    {
      title: "Настройка сайта",
      description: "Настройки сайта, контент и структура платформы.",
      links: [{ name: "Настройка сайта", href: "/admin/settings" }]
    },
    {
      title: "Маркетплейс",
      description: "Управление продажами и каталогом: товары, заказы и категории.",
      links: [{ name: "Маркетплейс решений", href: "/admin/products" }]
    },
    {
      title: "Журналы ХАССП",
      description: "Управление журналами ХАССП для клиентов.",
      links: [{ name: "Журналы ХАССП", href: "/admin/haccp" }]
    },
  ];

  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const userPermissions = (session?.user?.permissions || []).map(p => p.toLowerCase());

  const accessibleLinks = sections.flatMap(section => 
    section.links
      .filter(link => {
        if (isSuperAdmin) return true;
        const targetPath = link.href.toLowerCase();
        return userPermissions.some(p => p === targetPath || p.startsWith(targetPath + "/"));
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
        <h1 className="text-xl font-bold text-[#111827]">Нет доступных модулей</h1>
        <p className="text-gray-500 mt-2 text-sm">Обратитесь к администратору для получения прав.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      
      {/* PAGE HEADER: Панель управления */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight">
            Панель управления
          </h1>
          <p className="text-gray-500 font-medium mt-2 ml-1">
            Администрирование сервисов
          </p>
        </div>
        
        {/* Кнопка выхода */}
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:text-red-500 hover:border-red-100 transition-all shadow-sm group"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Выйти</span>
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessibleLinks.map((link, idx) => {
          const Icon = getIcon(link.href);
          
          return (
            <Link key={idx} href={link.href} className="no-underline group">
              {/* КАРТОЧКА: Hover - ИЗУМРУДНАЯ рамка (#10b981) */}
              <div className="relative h-64 p-8 bg-white rounded-[2.5rem] shadow-soft hover:shadow-xl border border-transparent hover:border-[#10b981] flex flex-col justify-between transition-all duration-300">
                
                {/* TOP */}
                <div className="flex justify-between items-start">
                  {/* ИКОНКА: Hover - ИЗУМРУДНЫЙ фон (#10b981), БЕЛЫЙ текст (для контраста) */}
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-white transition-colors duration-300">
                    <Icon size={24} />
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