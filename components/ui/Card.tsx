import React from "react";

export const Card = ({ 
  children, 
  className = "", 
  title 
}: { 
  children: React.ReactNode, 
  className?: string, 
  title?: string 
}) => {
  return (
    <div className={`
      relative overflow-hidden
      rounded-[40px] 
      bg-white/40 backdrop-blur-2xl 
      p-10 
      border border-white/60 
      shadow-[0_8px_32px_rgba(30,27,75,0.04)]
      transition-all duration-500 hover:shadow-[0_12px_48px_rgba(30,27,75,0.08)]
      ${className}
    `}>
      {/* Мягкий градиентный блик в углу для объема */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-100/20 blur-[60px] pointer-events-none" />
      
      {title && (
        <div className="relative mb-8 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[#a78bfa]/50" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1e1b4b]/80">
            {title}
          </h3>
        </div>
      )}
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
};