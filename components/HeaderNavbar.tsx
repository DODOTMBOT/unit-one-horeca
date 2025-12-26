"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuAccordionItem from "@/components/ui/MenuAccordionItem";

export default function HeaderNavbar({ menuItems }: { menuItems: any[] }) {
  const pathname = usePathname();

  return (
    /* Изменили bg-white/40 на bg-white и убрали shadow-inner для чистоты */
    <nav className="hidden lg:flex items-center gap-1 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
      <Link 
        href="/" 
        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${
          pathname === '/' 
            ? 'nav-pill-active scale-105 shadow-lg shadow-indigo-900/10' 
            : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50'
        }`}
      >
        Главная
      </Link>

      {menuItems.map((item: any) => (
        <MenuAccordionItem 
          key={item.id} 
          item={item} 
        />
      ))}
    </nav>
  );
}