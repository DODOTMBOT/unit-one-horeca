"use client";

import Link from "next/link";
import { 
  ShoppingBag, Users, GraduationCap, FileText, 
  Settings2, Layout, Image as ImageIcon, Menu, 
  ShieldCheck, ClipboardList, Tag, Smartphone,
  ArrowRight, Globe, Layers
} from "lucide-react";

export default function AdminHub() {
  const sections = [
    {
      title: "Маркетплейс решений",
      description: "Управление продажами и каталогом",
      color: "bg-indigo-50 text-indigo-600",
      links: [
        { name: "Товары", href: "/admin/products", icon: ShoppingBag },
        { name: "Заказы", href: "/admin/orders", icon: ClipboardList },
        { name: "Категории", href: "/admin/categories", icon: Layers },
      ]
    },
    {
      title: "Операционные сервисы",
      description: "Инструменты контроля и обучения",
      color: "bg-emerald-50 text-emerald-600",
      links: [
        { name: "Dodo Hunter", href: "/admin/hunter", icon: ShieldCheck },
        { name: "Платформа обучения", href: "/admin/learn", icon: GraduationCap },
        { name: "Медицинские книжки", href: "/admin/med-cards", icon: Users },
      ]
    },
    {
      title: "Безопасность и ХАССП",
      description: "Контроль качества и стандарты",
      color: "bg-orange-50 text-orange-600",
      links: [
        { name: "Журналы ХАССП", href: "/admin/haccp", icon: FileText },
        { name: "Маркировки", href: "/admin/marking", icon: Tag },
      ]
    },
    {
      title: "Настройки сайта",
      description: "Контент и структура платформы",
      color: "bg-slate-50 text-slate-600",
      links: [
        { name: "Экосистемы", href: "/admin/directions", icon: Globe },
        { name: "Навигация", href: "/admin/navigation", icon: Menu },
        { name: "Промо-баннеры", href: "/admin/promos", icon: ImageIcon },
        { name: "Наши клиенты", href: "/admin/clients", icon: Layout },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 pt-12">
        
        <header className="mb-16">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1e1b4b] mb-4">
            Панель управления
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-12 bg-indigo-500 rounded-full" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Unit One Ecosystem Management
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <div className="mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight text-[#1e1b4b] mb-1">
                  {section.title}
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  {section.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.links.map((link, lIdx) => (
                  <Link 
                    key={lIdx} 
                    href={link.href}
                    className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-[#1e1b4b] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${section.color} group-hover:bg-white/10 group-hover:text-white`}>
                        <link.icon size={20} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight text-slate-600 group-hover:text-white">
                        {link.name}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}