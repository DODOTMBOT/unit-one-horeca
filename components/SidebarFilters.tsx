"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, X } from "lucide-react"; // Установите lucide-react если нет

interface SidebarFiltersProps {
  categories: { id: string; name: string }[];
}

export default function SidebarFilters({ categories }: SidebarFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Состояние для открытия/закрытия секций
  const [openSections, setOpenSections] = useState({
    categories: false,
    types: false,
    price: false,
  });

  const currentCategoryId = searchParams.get("categoryId") || "";
  const currentType = searchParams.get("type") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2 py-4">
      
      {/* 1. КАТЕГОРИЯ ПРОДУКТА */}
      <div className="border-b border-slate-100 last:border-none">
        <button
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between py-4 px-1 text-sm font-semibold text-slate-700 hover:text-black transition-colors"
        >
          <span className="uppercase tracking-wider text-[11px]">Категория продукта</span>
          {openSections.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {openSections.categories && (
          <div className="flex flex-col gap-1 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <button
              onClick={() => updateFilters("categoryId", "")}
              className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                currentCategoryId === "" ? "bg-slate-100 text-black font-bold" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Все категории
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilters("categoryId", cat.id)}
                className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                  currentCategoryId === cat.id ? "bg-slate-100 text-black font-bold" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. ТИП ПРОДУКТА (Пример) */}
      <div className="border-b border-slate-100 last:border-none">
        <button
          onClick={() => toggleSection("types")}
          className="flex w-full items-center justify-between py-4 px-1 text-sm font-semibold text-slate-700 hover:text-black transition-colors"
        >
          <span className="uppercase tracking-wider text-[11px]">Тип продукта</span>
          {openSections.types ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {openSections.types && (
          <div className="flex flex-col gap-1 pb-4">
            {["Шаблон", "Инструкция", "Курс", "Чек-лист"].map((type) => (
              <button
                key={type}
                onClick={() => updateFilters("type", type)}
                className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                  currentType === type ? "bg-slate-100 text-black font-bold" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. ЦЕНА */}
      <div className="border-b border-slate-100 last:border-none">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between py-4 px-1 text-sm font-semibold text-slate-700 hover:text-black transition-colors"
        >
          <span className="uppercase tracking-wider text-[11px]">Цена</span>
          {openSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {openSections.price && (
          <div className="grid grid-cols-2 gap-3 pb-6 pt-2">
            <input
              type="number"
              placeholder="От"
              value={minPrice}
              onChange={(e) => updateFilters("minPrice", e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-black/5 outline-none transition-all"
            />
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => updateFilters("maxPrice", e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-black/5 outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* СБРОС ФИЛЬТРОВ */}
      {(currentCategoryId || currentType || minPrice || maxPrice) && (
        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
        >
          <X size={12} /> Сбросить фильтры
        </button>
      )}
    </div>
  );
}