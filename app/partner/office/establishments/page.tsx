"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { 
  Plus, X, Loader2, ArrowLeft, 
  ChevronRight, Search, Copy, Check, Trash2, MapPin, Building2, AlertTriangle, Home, LayoutGrid, ChevronDown, Edit2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "active" | "unassigned";

// --- КОМПОНЕНТ МОДАЛЬНОГО ОКНА ---
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: any) {
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
              className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden pointer-events-auto p-8 border border-slate-100 shadow-2xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <AlertTriangle size={32} />
                </div>
              </div>
              <h3 className="text-xl font-black text-[#1e1b4b] text-center uppercase tracking-tight mb-2">{title}</h3>
              <p className="text-slate-500 text-center text-sm font-medium leading-relaxed mb-8 uppercase">{message}</p>
              <div className="flex flex-col gap-2">
                <button onClick={onConfirm} className="w-full py-4 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">
                  Удалить
                </button>
                <button onClick={onCancel} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50 transition-all">
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function EstablishmentsPage() {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({
    show: false, id: "", name: ""
  });

  const [form, setForm] = useState({ name: "", city: "", address: "" });

  const fetchEstablishments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/establishments", { cache: 'no-store' });
      const data = await res.json();
      const ests = Array.isArray(data) ? data : [];
      setEstablishments(ests);

      const initialExpanded: Record<string, boolean> = {};
      ests.forEach((e: any) => { if(e.city) initialExpanded[e.city.toUpperCase()] = true; });
      setExpandedGroups(initialExpanded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEstablishments(); }, [fetchEstablishments]);

  const groupedData = useMemo(() => {
    const filtered = establishments.filter(e => 
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: Record<string, any[]> = {};
    filtered.forEach(est => {
      const cityKey = (est.city || "ДРУГИЕ").toUpperCase();
      if (!groups[cityKey]) groups[cityKey] = [];
      groups[cityKey].push(est);
    });

    return Object.keys(groups).sort().map(city => ({
      cityName: city.toUpperCase(),
      items: groups[city]
    }));
  }, [establishments, searchQuery]);

  const toggleGroup = (city: string) => {
    setExpandedGroups(prev => ({ ...prev, [city.toUpperCase()]: !prev[city.toUpperCase()] }));
  };

  const copyToClipboard = (code: string, id: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/establishments/${editingId}` : "/api/establishments";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchEstablishments();
        setIsAdding(false);
        setEditingId(null);
        setForm({ name: "", city: "", address: "" });
      }
    } finally { setIsSaving(false); }
  };

  const startEdit = (est: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setForm({ name: est.name, city: est.city, address: est.address });
    setEditingId(est.id);
    setIsAdding(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/establishments/${deleteModal.id}`, { method: "DELETE" });
      if (res.ok) setEstablishments(prev => prev.filter(est => est.id !== deleteModal.id));
    } finally {
      setDeleteModal({ show: false, id: "", name: "" });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="animate-spin text-[#10b981]" size={40} />
      <div className="text-xs tracking-[0.2em] font-bold uppercase text-gray-400">Загрузка реестра...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto px-4">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/partner/office" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none uppercase">Рестораны</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider">Управление объектами сети</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="ПОИСК ОБЪЕКТА..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#10b981] w-64 lg:w-80 transition-all shadow-sm focus:ring-4 ring-[#10b981]/5 uppercase"
            />
          </div>
          <button 
            onClick={() => {
              if (isAdding) {
                setEditingId(null);
                setForm({ name: "", city: "", address: "" });
              }
              setIsAdding(!isAdding);
            }} 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${isAdding ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-[#10b981] border-[#10b981] text-white hover:bg-[#0ea371]"}`}
          >
             {isAdding ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>
      </header>

      {/* ФОРМА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ */}
      <AnimatePresence>
        {isAdding && (
          <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-soft mb-4">
            <h2 className="text-[11px] font-black uppercase text-gray-400 mb-4 tracking-widest">
              {editingId ? "Редактирование объекта" : "Новый объект"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input required placeholder="Название" className="bg-slate-50 rounded-xl px-5 py-3 text-xs font-bold uppercase outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 border-transparent transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} />
              <input required placeholder="Город" className="bg-slate-50 rounded-xl px-5 py-3 text-xs font-bold uppercase outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 border-transparent transition-all" value={form.city} onChange={e => setForm({...form, city: e.target.value.toUpperCase()})} />
              <input required placeholder="Адрес" className="bg-slate-50 rounded-xl px-5 py-3 text-xs font-bold uppercase outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 border-transparent transition-all" value={form.address} onChange={e => setForm({...form, address: e.target.value.toUpperCase()})} />
              <button disabled={isSaving} className="bg-[#10b981] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0ea371] transition-all disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : (editingId ? "Сохранить" : "Добавить объект")}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ТАБЛИЦА */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Название и адрес</th>
              <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Код приглашения</th>
              <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Управление</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.map((group) => {
              const isExpanded = expandedGroups[group.cityName] !== false;
              return (
                <Fragment key={group.cityName}>
                  <tr onClick={() => toggleGroup(group.cityName)} className="cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 border-b border-gray-100">
                    <td colSpan={3} className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 shadow-sm">
                          <MapPin size={20} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wide text-slate-700">{group.cityName}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-lg font-bold bg-white border border-slate-200 text-slate-400">
                          {group.items.length}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && group.items.map((est) => (
                    <tr key={est.id} className="group transition-colors border-b border-gray-50 last:border-0 relative">
                      <td className="px-0 py-0 relative">
                        {/* Весь блок данных - ссылка */}
                        <Link 
                          href={`/partner/office/establishments/${est.id}`}
                          className="flex flex-col px-10 py-5 w-full h-full hover:bg-emerald-50/20 transition-colors"
                        >
                          <span className="text-[15px] font-bold text-gray-800 group-hover:text-[#10b981] transition-colors uppercase">{est.name}</span>
                          <span className="text-xs text-gray-400 mt-1 font-medium italic uppercase">{est.address}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(est.inviteCode, est.id);
                            }}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group/code"
                          >
                            <code className="text-xs font-black text-slate-600 tracking-widest uppercase">{est.inviteCode || "———"}</code>
                            {copiedId === est.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-300 group-hover/code:text-emerald-500" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => startEdit(est, e)}
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-[#10b981] hover:text-white transition-all"
                            title="Редактировать"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setDeleteModal({ show: true, id: est.id, name: est.name });
                            }}
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all"
                            title="Удалить"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {groupedData.length === 0 && (
          <div className="py-24 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest bg-gray-50/10">
            Заведения не найдены
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="flex justify-between items-center px-4 mt-4 opacity-50">
        <div className="flex items-center gap-3">
          <LayoutGrid size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 uppercase">Unit One Ecosystem v.2.4</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#10b981] uppercase">Establishments Control</span>
        </div>
      </footer>

      <ConfirmModal
        isOpen={deleteModal.show}
        title="Удаление объекта"
        message={`Вы уверены, что хотите полностью удалить "${deleteModal.name.toUpperCase()}"? Это действие необратимо.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ show: false, id: "", name: "" })}
      />
    </div>
  );
}