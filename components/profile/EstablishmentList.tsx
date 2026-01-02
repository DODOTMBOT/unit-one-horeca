"use client";

import { useState } from "react";
import { Briefcase, ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function EstablishmentList({ establishments, title, isPartner }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
             <Briefcase size={24} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
              {title}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Всего объектов: {establishments.length}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-xl bg-slate-50 text-slate-300 transition-all ${isOpen ? 'rotate-180 bg-indigo-50 text-indigo-500' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-8 space-y-3">
              {establishments.length > 0 ? (
                establishments.map((est: any) => (
                  <div key={est.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-50">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight text-slate-800">{est.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{est.city}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/partner/office/establishments/${est.id}`} 
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-indigo-500 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <ArrowLeft size={16} className="rotate-180" />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-[11px] font-black text-slate-300 uppercase italic text-center py-4">Список объектов пуст</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}