"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Хук для мгновенного отслеживания пути
import { ChevronDown } from "lucide-react";

interface MenuItemProps {
  item: {
    id: string;
    title: string;
    href: string | null;
    isAdmin: boolean;
    children?: MenuItemProps['item'][];
  };
}

export default function MenuAccordionItem({ item }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Получаем живой путь
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasChildren = item.children && item.children.length > 0;

  // 1. Активность родителя (например, подсветка "Админ", если мы в /admin/...)
  const isParentActive = item.href !== "/" && item.href 
    ? pathname.startsWith(item.href) 
    : false;

  // 2. Активность через вложенные пункты
  const isAnyChildActive = hasChildren && item.children?.some(child => 
    child.href && pathname.startsWith(child.href)
  );

  const isActive = isParentActive || isAnyChildActive;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Кнопка в шапке */}
      <div className={`
        flex items-center gap-1.5 px-5 py-2 rounded-full transition-all duration-300 cursor-pointer
        ${isActive ? 'bg-[#1e1b4b] text-white scale-105' : 'text-slate-400 hover:text-[#1e1b4b] hover:bg-slate-50'}
      `}>
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
          {item.title}
        </span>
        
        {hasChildren && (
          <ChevronDown 
            size={12} 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            strokeWidth={3}
          />
        )}
      </div>

      {/* ВЫПАДАЮЩЕЕ МЕНЮ */}
      {hasChildren && (
        <div className={`
          absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3
          bg-white rounded-[28px] border border-slate-100 shadow-2xl shadow-indigo-100/50
          transition-all duration-300 origin-top z-[100]
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}>
          <div className="flex flex-col gap-1">
            {item.children?.map((child) => {
              // Дочерний пункт активен при точном совпадении
              const isChildActive = child.href === pathname;

              return (
                <Link 
                  key={child.id} 
                  href={child.href || '#'} 
                  className={`
                    flex items-center justify-between p-3 rounded-2xl text-[12px] font-bold transition-all
                    ${isChildActive 
                      ? 'bg-[#f3f0ff] text-[#a78bfa]' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e1b4b]'}
                  `}
                >
                  <span>{child.title}</span>
                  {child.isAdmin && (
                    <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}