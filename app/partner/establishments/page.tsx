"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, X, Loader2, ArrowLeft, 
  ChevronRight, Search, Copy, Check, Trash2, MapPin, Building2, AlertTriangle, Home, LogOut, LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- КОМПОНЕНТ МОДАЛЬНОГО ОКНА ---
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Удалить", cancelText = "Отмена" }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" 
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl shadow-indigo-900/20 overflow-hidden pointer-events-auto p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <AlertTriangle size={32} />
                </div>
              </div>
              <h3 className="text-xl font-black text-[#1e1b4b] text-center uppercase tracking-tight mb-2">{title}</h3>
              <p className="text-slate-500 text-center text-sm font-medium leading-relaxed mb-8">{message}</p>
              <div className="flex flex-col gap-2">
                <button onClick={onConfirm} className="w-full py-4 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-xs hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all">
                  {confirmText}
                </button>
                <button onClick={onCancel} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50 transition-all">
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function PartnerEstablishments() {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({
    show: false,
    id: "",
    name: ""
  });

  const [form, setForm] = useState({ name: "", city: "", address: "" });

  const fetchEstablishments = useCallback(async () => {
    try {
      const res = await fetch("/api/establishments", { cache: 'no-store' });
      const data = await res.json();
      setEstablishments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEstablishments(); }, [fetchEstablishments]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ show: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    try {
      const res = await fetch(`/api/establishments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEstablishments(prev => prev.filter(est => est.id !== id));
      }
    } catch (error) {
      alert("Ошибка удаления");
    } finally {
      setDeleteModal({ show: false, id: "", name: "" });
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEst = establishments.filter(e => 
    e.name?.toLowerCase().includes(search.toLowerCase()) || 
    e.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/establishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchEstablishments();
        setIsAdding(false);
        setForm({ name: "", city: "", address: "" });
      }
    } finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b]">
      {/* --- ХЕДЕР --- */}
      <div className="bg-[#F8FAFC] sticky top-0 z-50 p-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Левый блок (поиск) */}
          <div className="flex-1 hidden md:flex justify-start items-center gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                    placeholder="ПОИСК..." 
                    className="pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-200 w-[240px] transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

          {/* ЦЕНТРАЛЬНЫЙ БЛОК (НАЗВАНИЕ СТРАНИЦЫ) */}
          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Объекты <span className="text-indigo-500 ml-1 opacity-50">{establishments.length}</span>
            </h1>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: НАВИГАЦИЯ */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:bg-slate-50 transition-colors group flex items-center gap-4"
            >
              <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Home size={14} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Назад</p>
            </Link>

            <Link 
              href="/" 
              className="w-14 h-14 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
              title="Выйти"
            >
              <LogOut size={22} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-12">
        
        {/* КОНТЕКСТНАЯ ПАНЕЛЬ НАД КАРТОЧКАМИ */}
        <div className="flex justify-end mb-6">
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="px-6 py-3.5 bg-white border border-slate-100 rounded-[1.2rem] transition-all hover:border-indigo-200 shadow-sm group"
            >
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 leading-none flex items-center gap-2">
                    {isAdding ? <X size={14} /> : <Plus size={14} />}
                    {isAdding ? "Отмена" : "Добавить объект"}
                </p>
            </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col md:flex-row gap-4">
              <input required placeholder="НАЗВАНИЕ" className="flex-[1.5] bg-slate-50 rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none border-transparent focus:bg-white focus:ring-1 ring-indigo-500 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required placeholder="ГОРОД" className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none border-transparent focus:bg-white focus:ring-1 ring-indigo-500 transition-all" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              <input required placeholder="АДРЕС" className="flex-[2] bg-slate-50 rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none border-transparent focus:bg-white focus:ring-1 ring-indigo-500 transition-all" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              <button disabled={isSaving} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : "СОХРАНИТЬ"}
              </button>
            </div>
          </form>
        )}

        {/* GRID OF CARDS */}
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
        ) : filteredEst.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-dashed border-2 border-slate-100">
            <Building2 className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Нет доступных объектов</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredEst.map((est) => (
              <div key={est.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between h-[220px]">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[16px] font-black uppercase tracking-tight text-[#1e1b4b] truncate pr-2 leading-tight">
                      {est.name}
                    </h3>
                    <button 
                      onClick={() => handleDeleteClick(est.id, est.name)}
                      className="text-slate-200 hover:text-rose-500 transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-400">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <span className="text-[11px] font-bold uppercase leading-tight line-clamp-2">{est.city}, {est.address}</span>
                  </div>
                </div>

                <div className="space-y-4 mt-auto">
                  {/* ИНВАЙТ КОД */}
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Code</span>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-black text-indigo-600 leading-none tracking-widest">{est.inviteCode || "..."}</code>
                      <button onClick={() => copyToClipboard(est.inviteCode, est.id)} className="text-slate-300 hover:text-indigo-600">
                        {copiedId === est.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  {/* ПЕРЕХОД */}
                  <div className="flex items-center">
                    <Link href={`/partner/establishments/${est.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1e1b4b] text-white hover:bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Открыть панель <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-20 mb-12">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]">Unit One Ecosystem v.2.4</p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.show}
        title="Удаление объекта"
        message={`Вы уверены, что хотите удалить заведение "${deleteModal.name}"? Это действие невозможно отменить.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ show: false, id: "", name: "" })}
      />
    </div>
  );
}