"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuAccordionItem from "@/components/ui/MenuAccordionItem";

export default function HeaderNavbar({ menuItems }: { menuItems: any[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-1 bg-white p-1.5 rounded-full border border-slate-100">
      <Link 
        href="/" 
        className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300 ${
          pathname === '/' 
            ? 'bg-[#1e1b4b] text-white' 
            : 'text-slate-400 hover:text-[#7171a7] hover:bg-slate-50/50'
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