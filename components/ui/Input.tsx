"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Добавляем явный экспорт через именованную константу
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full group">
        {label && (
          <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-focus-within:text-[#a78bfa]">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full appearance-none rounded-[20px] border-2 px-6 py-4 text-sm font-bold outline-none transition-all duration-300
              placeholder:text-slate-300 placeholder:font-medium
              ${error 
                ? "border-red-200 bg-red-50 text-red-900 focus:border-red-400" 
                : "border-slate-100 bg-white text-[#1e1b4b] hover:border-slate-200 hover:bg-slate-50 focus:bg-white focus:border-[#a78bfa] focus:shadow-[0_10px_30px_-10px_rgba(167,139,250,0.2)]"
              } 
              ${className}
            `}
            {...props}
          />
          <div className={`absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#a78bfa] transition-all duration-500 group-focus-within:w-1/3 opacity-50`} />
        </div>
        {error && (
          <span className="mt-2 ml-2 block text-[10px] font-black uppercase tracking-wider text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";