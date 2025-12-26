"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react"; 

export default function HeaderCartBtn({ count }: { count?: number }) {
  return (
    <Link href="/cart" className="relative group p-2">
      <div className="flex items-center gap-2 text-slate-400 group-hover:text-black transition-colors">
        <ShoppingBag size={20} /> 
        
        {/* Счетчик товаров (красный кружок) */}
        {(count || 0) > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}