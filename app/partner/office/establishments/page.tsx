"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { 
  Plus, X, Loader2, ArrowLeft, Search, Copy, Check, Trash2, MapPin, LayoutGrid, ChevronDown, Edit2, AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- КОМПОНЕНТ МОДАЛЬНОГО ОКНА ---
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDeleting }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={!isDeleting ? onCancel : undefined} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" 
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-white w-full max-w-sm rounded-[32px] p-8 border border-slate-100 shadow-2xl pointer-events-auto"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  {isDeleting ? <Loader2 className="animate-spin" size={32} /> : <AlertTriangle size={32} />}
                </div>
              </div>
              <h3 className="text-xl font-black text-[#1e1b4b] text-center uppercase mb-2">{title}</h3>
              <p className="text-slate-500 text-center text-sm mb-8 uppercase leading-relaxed">{message}</p>
              
              <div className="flex flex-col gap-2">
                <button 
                  disabled={isDeleting}
                  onClick={onConfirm} 
                  className="w-full py-4 rounded-2xl bg-rose-500 text-white font-black uppercase text-xs shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? "Удаление..." : "Удалить"}
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={onCancel} 
                  className="w-full py-4 rounded-2xl font-black uppercase text-xs text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

export default function EstablishmentsPage() {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", city: "", address: "" });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: "", name: "" });

  const fetchEstablishments = useCallback(async () => {
    try {
      setLoading(true);
      // t=Date.now() гарантирует получение свежих данных без кеша
      const res = await fetch(`/api/establishments?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      const ests = Array.isArray(data) ? data : [];
      setEstablishments(ests);
      
      const initial: any = {};
      ests.forEach((e: any) => { if(e.city) initial[e.city.toUpperCase()] = true; });
      setExpandedGroups(initial);
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
    return Object.keys(groups).sort().map(city => ({ cityName: city, items: groups[city] }));
  }, [establishments, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId ? `/api/establishments/${editingId}` : "/api/establishments";
      const method = editingId ? "PATCH" : "POST";
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
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const startEdit = (est: any, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setForm({ name: est.name, city: est.city, address: est.address });
    setEditingId(est.id);
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    const targetId = deleteModal.id;
    
    try {
      // DELETE запрос с защитой от кеширования
      const res = await fetch(`/api/establishments/${targetId}?v=${Date.now()}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Успех: убираем из списка и закрываем модалку
        setEstablishments(prev => prev.filter(e => e.id !== targetId));
        setDeleteModal({ show: false, id: "", name: "" });
      } else {
        // Выводим ошибку, если сервер (API) вернул 403 или другую ошибку
        alert(`ОШИБКА: ${result.error || "Не удалось удалить объект"}`);
        setDeleteModal({ show: false, id: "", name: "" });
      }
    } catch (error) {
      alert("Сетевая ошибка при удалении");
      setDeleteModal({ show: false, id: "", name: "" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto px-4 uppercase">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/partner/office" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#10b981] transition-all shadow-sm"><ArrowLeft size={24} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-none tracking-tight">Рестораны</h1>
            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wider">Управление сетью</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input placeholder="ПОИСК..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toUpperCase())} className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none w-64 lg:w-80 shadow-sm font-bold" />
          </div>
          <button onClick={() => { if(isAdding) setEditingId(null); setIsAdding(!isAdding); setForm({ name: "", city: "", address: "" }); }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${isAdding ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-[#10b981] border-[#10b981] text-white"}`}>
            {isAdding ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-soft mb-4">
            <h2 className="text-[11px] font-black uppercase text-gray-400 mb-4 tracking-widest">{editingId ? "Редактирование объекта" : "Новый объект"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input required placeholder="Название" className="bg-slate-50 rounded-xl px-5 py-3 text-xs font-bold uppercase outline-none focus:bg-white transition-all border-none" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} />
              <input required placeholder="Город" className="bg-slate-50 rounded-xl px-5 py-3 text-xs font-bold uppercase outline-none focus:bg-white transition-all border-none" value={form.city} onChange={e => setForm({...form, city: e.target.value.toUpperCase()})} />
              <input required placeholder="Адрес" className="bg-slate-50 rounded-xl px-5 py-3 text-xs font-bold uppercase outline-none focus:bg-white transition-all border-none" value={form.address} onChange={e => setForm({...form, address: e.target.value.toUpperCase()})} />
              <button disabled={isSaving} className="bg-[#10b981] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0ea371] disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : (editingId ? "Сохранить" : "Добавить")}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <tbody>
            {groupedData.map((group) => (
              <Fragment key={group.cityName}>
                <tr onClick={() => setExpandedGroups(p => ({ ...p, [group.cityName]: !p[group.cityName] }))} className="cursor-pointer bg-slate-50 border-b border-gray-100 transition-colors hover:bg-slate-100">
                  <td colSpan={3} className="px-8 py-4 font-bold text-slate-700 uppercase">
                    <ChevronDown size={20} className={`inline mr-2 transition-transform ${expandedGroups[group.cityName] ? '' : '-rotate-90'}`} />{group.cityName}
                  </td>
                </tr>
                {expandedGroups[group.cityName] !== false && group.items.map((est) => (
                  <tr key={est.id} className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-emerald-50/10">
                    <td className="px-10 py-5">
                      <Link href={`/partner/office/establishments/${est.id}`} className="block">
                        <span className="text-[15px] font-bold text-gray-800 uppercase group-hover:text-[#10b981] transition-colors">{est.name}</span>
                        <p className="text-xs text-gray-400 mt-1 uppercase italic">{est.address}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(est.inviteCode); setCopiedId(est.id); setTimeout(() => setCopiedId(null), 2000); }} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 mx-auto hover:bg-white transition-all">
                        <code className="text-xs font-black tracking-widest uppercase">{est.inviteCode || "---"}</code>
                        {copiedId === est.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={(e) => startEdit(est, e)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-[#10b981] hover:text-white transition-all shadow-sm"><Edit2 size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, id: est.id, name: est.name }); }} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.show} 
        isDeleting={isDeleting}
        title="Удаление" 
        message={`Удалить "${deleteModal.name}"?`} 
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, id: "", name: "" })} 
      />
    </div>
  );
}