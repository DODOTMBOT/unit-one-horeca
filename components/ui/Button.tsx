import React from "react";
import { Loader2 } from "lucide-react"; // Импортируем иконку для спиннера

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

export const Button = ({ 
  children, 
  variant = "primary", 
  isLoading, 
  className = "", 
  disabled,
  ...props 
}: ButtonProps) => {
  
  const baseStyles = "relative flex items-center justify-center rounded-full px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:pointer-events-none";
  
  const variants = {
    // Обновили primary под наш темно-синий и лавандовый при ховере
    primary: "bg-[#1e1b4b] text-white shadow-xl shadow-purple-900/10 hover:bg-[#a78bfa] hover:shadow-purple-400/30 hover:-translate-y-1",
    secondary: "bg-white border-2 border-slate-100 text-[#1e1b4b] hover:bg-slate-50 hover:border-slate-200",
    danger: "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white",
    ghost: "bg-transparent text-slate-400 hover:text-[#1e1b4b] hover:bg-slate-50",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Спиннер загрузки */}
      {isLoading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {/* Контент кнопки, который становится прозрачным при загрузке */}
      <span className={`flex items-center gap-2 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
};