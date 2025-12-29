"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Удалить", cancelText = "Отмена" }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay с принудительным легким размытием */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.1)', backdropFilter: 'blur(4px)' }}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white w-full max-w-[300px] !rounded-[24px] !shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                    <AlertCircle size={16} />
                  </div>
                  <h3 className="text-[13px] font-black text-[#1e1b4b] uppercase tracking-tight">
                    {title}
                  </h3>
                </div>
                
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-6">
                  {message}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 !rounded-xl font-black uppercase tracking-widest text-[9px] text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all border border-transparent"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 py-2.5 !rounded-xl font-black uppercase tracking-widest text-[9px] text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-sm"
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}