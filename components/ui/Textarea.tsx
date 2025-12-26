import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full group">
        {label && (
          <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-focus-within:text-[#a78bfa]">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            className={`
              w-full rounded-[28px] border-2 px-6 py-5 text-sm font-bold outline-none transition-all duration-300 resize-none
              placeholder:text-slate-300 placeholder:font-medium
              ${error 
                ? "border-red-200 bg-red-50 text-red-900 focus:border-red-400" 
                : "border-slate-200 bg-slate-50/50 text-[#1e1b4b] hover:border-slate-300 hover:bg-slate-100/50 focus:bg-white focus:border-[#a78bfa] focus:shadow-[0_0_25px_rgba(167,139,250,0.1)]"
              } 
              ${className}
            `}
            {...props}
          />
          <div className={`absolute bottom-4 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#a78bfa] transition-all duration-500 group-focus-within:w-1/4 opacity-40`} />
        </div>
        {error && (
          <span className="mt-2 ml-2 block text-[10px] font-black uppercase tracking-wider text-red-500 animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";