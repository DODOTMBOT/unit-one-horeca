"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  value?: string | number | null;
  onChange?: (value: string) => void;
  className?: string;
}

export const Select = ({ 
  label, 
  error, 
  options = [], 
  placeholder = "-- Выберите --", 
  value, 
  onChange, 
  className = "" 
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Обработка клика снаружи для закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ищем выбранную опцию. Приводим все к строке, чтобы '1' (string) нашло 1 (int)
  // Это критично для данных из БД Prisma
  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const handleSelect = (val: string | number) => {
    onChange?.(String(val));
    setIsOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {label}
        </label>
      )}
      
      {/* КНОПКА (ТРИГГЕР) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-full flex items-center justify-between rounded-[24px] border-2 px-6 py-4 text-sm font-bold transition-all cursor-pointer bg-white select-none
          ${error 
            ? "border-red-200 text-red-900" 
            : isOpen 
              ? "border-[#a78bfa] shadow-lg z-20" 
              : "border-slate-200 text-[#1e1b4b] hover:border-slate-300"
          }
        `}
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <ChevronDown 
          size={18} 
          className={`transition-transform duration-200 text-slate-400 flex-shrink-0 ${isOpen ? "rotate-180 text-[#a78bfa]" : ""}`} 
        />
      </div>

      {/* ВЫПАДАЮЩИЙ СПИСОК (ABSOLUTE) */}
      {/* z-50 гарантирует, что он будет выше контента внутри текущего контейнера */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50">
          <ul className="max-h-[280px] overflow-y-auto rounded-[24px] border border-slate-100 bg-white shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100">
            {options.length > 0 ? options.map((opt) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <li
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  className={`
                    flex items-center justify-between px-5 py-3.5 rounded-[16px] text-sm font-bold cursor-pointer transition-colors mb-1 last:mb-0
                    ${isSelected 
                      ? "bg-[#f3f0ff] text-[#a78bfa]" 
                      : "text-[#1e1b4b] hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="truncate mr-2">{opt.label}</span>
                  {isSelected && <Check size={16} strokeWidth={3} className="flex-shrink-0 text-[#a78bfa]" />}
                </li>
              );
            }) : (
              <li className="px-5 py-4 text-xs text-slate-400 text-center font-bold uppercase">
                Нет данных
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <span className="mt-2 ml-4 block text-[10px] font-black uppercase text-red-500">{error}</span>}
    </div>
  );
};