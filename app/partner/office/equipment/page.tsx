"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Fragment } from "react";
import { 
  ArrowLeft, Loader2, Plus, X, Search, Trash2, Edit3, ChevronDown, Check, Home, LayoutGrid, Building2, Thermometer
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- КАСТОМНЫЙ ВЫПАДАЮЩИЙ СПИСОК (В СТИЛЕ ЖУРНАЛОВ) ---
function CustomSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string, 
  options: { id: string, name: string }[], 
  value: string, 
  onChange: (id: string) => void,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 relative uppercase" ref={containerRef}>
      <label className="text-[9px] font-black text-gray-400 ml-1 tracking-widest">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-50 border-transparent rounded-xl px-5 py-3 text-[11px] font-bold outline-none hover:bg-gray-100 transition-all text-left min-h-[46px]"
      >
        <span className={`truncate pr-2 ${selectedOption ? "text-gray-800" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-5 py-3 text-[11px] font-bold hover:bg-emerald-50 hover:text-[#10b981] transition-colors text-left"
              >
                <span>{opt.name}</span>
                {value === opt.id && <Check size={14} className="text-[#10b981] shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartnerEquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({ 
    name: "", 
    type: "ХОЛОДИЛЬНОЕ", 
    zone: "", 
    establishmentId: "" 
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [eqRes, estRes] = await Promise.all([
        fetch("/api/partner/equipment"),
        fetch("/api/establishments")
      ]);
      const eqData = await eqRes.json();
      const estData = await estRes.json();
      
      setEquipment(Array.isArray(eqData) ? eqData : []);
      setEstablishments(Array.isArray(estData) ? estData : []);

      // Раскрываем все группы по умолчанию
      const initialExpanded: Record<string, boolean> = {};
      estData.forEach((e: any) => { initialExpanded[e.id] = true; });
      setExpandedGroups(initialExpanded);

      if (estData.length > 0 && !form.establishmentId) {
        setForm(f => ({ ...f, establishmentId: estData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Группировка оборудования по заведениям
  const groupedEquipment = useMemo(() => {
    const filtered = equipment.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.establishment?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: Record<string, any[]> = {};
    filtered.forEach(eq => {
      const estId = eq.establishmentId;
      if (!groups[estId]) groups[estId] = [];
      groups[estId].push(eq);
    });

    return establishments.map(est => ({
      ...est,
      items: groups[est.id] || []
    })).filter(g => g.items.length > 0 || searchQuery === "");
  }, [equipment, establishments, searchQuery]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (eq: any) => {
    setEditingId(eq.id);
    setForm({
      name: eq.name.toUpperCase(),
      type: eq.type.toUpperCase(),
      zone: (eq.zone || "").toUpperCase(),
      establishmentId: eq.establishmentId
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId 
        ? `/api/partner/equipment/${editingId}` 
        : "/api/partner/equipment";
      
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchData();
        setIsAdding(false);
        setEditingId(null);
        setForm({ ...form, name: "", zone: "", type: "ХОЛОДИЛЬНОЕ" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm("УДАЛИТЬ ЭТО ОБОРУДОВАНИЕ?")) return;
    try {
      const res = await fetch(`/api/partner/equipment/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEquipment(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      alert("ОШИБКА ПРИ УДАЛЕНИИ");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="animate-spin text-[#10b981]" size={40} />
      <div className="text-xs tracking-[0.2em] font-bold uppercase text-gray-400">СИНХРОНИЗАЦИЯ ПАРКА...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto px-4 uppercase">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/partner/office" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none uppercase">ОБОРУДОВАНИЕ</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider">ТЕХНИЧЕСКИЙ ПАРК СЕТИ</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="ПОИСК..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#10b981] w-64 lg:w-80 transition-all shadow-sm focus:ring-4 ring-[#10b981]/5 uppercase"
            />
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (isAdding) setEditingId(null);
            }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${
              isAdding 
              ? "bg-rose-50 border-rose-100 text-rose-500" 
              : "bg-[#10b981] border-[#10b981] text-white hover:bg-[#0ea371]"
            }`}
          >
            {isAdding ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>
      </header>

      {/* ФОРМА ДОБАВЛЕНИЯ */}
      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            onSubmit={handleSubmit} 
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-soft mb-4"
          >
            <h2 className="text-[11px] font-black text-[#10b981] mb-8 tracking-[0.2em] uppercase">
              {editingId ? "РЕДАКТИРОВАНИЕ УСТРОЙСТВА" : "РЕГИСТРАЦИЯ НОВОГО ОБОРУДОВАНИЯ"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-gray-400 ml-1 tracking-widest uppercase">НАЗВАНИЕ</label>
                <input required className="bg-gray-50 border-transparent rounded-xl px-5 py-4 text-[11px] font-bold uppercase outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} placeholder="ХОЛОДИЛЬНИК" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-gray-400 ml-1 tracking-widest uppercase">ЗОНА УСТАНОВКИ</label>
                <input required className="bg-gray-50 border-transparent rounded-xl px-5 py-4 text-[11px] font-bold uppercase outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 transition-all" value={form.zone} onChange={e => setForm({...form, zone: e.target.value.toUpperCase()})} placeholder="КУХНЯ / БАР" />
              </div>

              <CustomSelect 
                label="ТИП"
                value={form.type}
                onChange={(val) => setForm({...form, type: val})}
                options={[
                  { id: "ХОЛОДИЛЬНОЕ", name: "ХОЛОДИЛЬНОЕ" },
                  { id: "МОРОЗИЛЬНОЕ", name: "МОРОЗИЛЬНОЕ" }
                ]}
              />

              <CustomSelect 
                label="ЗАВЕДЕНИЕ"
                value={form.establishmentId}
                onChange={(val) => setForm({...form, establishmentId: val})}
                options={establishments.map(est => ({ 
                  id: est.id, 
                  name: `${est.name.toUpperCase()} (${est.city.toUpperCase()})` 
                }))}
                placeholder="ВЫБРАТЬ ТОЧКУ"
              />
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-50 flex justify-end">
              <button disabled={isSaving} className="bg-[#10b981] text-white px-10 py-4 rounded-2xl text-[11px] font-black tracking-widest hover:bg-[#0ea371] transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : (editingId ? "СОХРАНИТЬ ИЗМЕНЕНИЯ" : "ЗАРЕГИСТРИРОВАТЬ ОБЪЕКТ")}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ТАБЛИЦА С ГРУППИРОВКОЙ */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">НАЗВАНИЕ УСТРОЙСТВА</th>
              <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">ТИП / ЗОНА</th>
              <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">УПРАВЛЕНИЕ</th>
            </tr>
          </thead>
          <tbody>
            {groupedEquipment.map((group) => {
              const isExpanded = expandedGroups[group.id] !== false;
              return (
                <Fragment key={group.id}>
                  {/* Группировка по заведению */}
                  <tr onClick={() => toggleGroup(group.id)} className="cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 border-b border-gray-100">
                    <td colSpan={3} className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 shadow-sm">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <span className="text-sm font-bold uppercase tracking-wide text-slate-700">{group.name}</span>
                          <p className="text-[10px] text-slate-400 font-medium leading-none mt-1 tracking-tight">{group.address}, {group.city}</p>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-lg font-bold bg-white border border-slate-200 text-slate-400 ml-1">
                          {group.items.length}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Список оборудования */}
                  {isExpanded && group.items.map((eq: any) => (
                    <tr key={eq.id} className="group hover:bg-emerald-50/20 transition-colors border-b border-gray-50 last:border-0">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#10b981] group-hover:text-white transition-all">
                            <Thermometer size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-gray-800 group-hover:text-[#10b981] transition-colors">{eq.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-0.5">ID: {eq.id.slice(0,8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-black text-[#10b981] tracking-tight">{eq.type}</span>
                          <span className="text-[10px] font-bold text-gray-400 mt-1">{eq.zone || "ОСНОВНАЯ ЗОНА"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(eq)}
                            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#10b981] hover:text-white transition-all"
                            title="РЕДАКТИРОВАТЬ"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => deleteEquipment(eq.id)}
                            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-rose-500 hover:text-white transition-all"
                            title="УДАЛИТЬ"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {isExpanded && group.items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-10 py-8 text-center text-[11px] font-bold text-gray-300 tracking-[0.2em] bg-gray-50/20 uppercase">
                        В ЭТОМ ЗАВЕДЕНИИ НЕТ ОБОРУДОВАНИЯ
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <footer className="flex justify-between items-center px-4 mt-12 opacity-50">
        <div className="flex items-center gap-3">
          <LayoutGrid size={16} />
          <p className="text-[10px] font-bold tracking-[0.4em] text-gray-400">UNIT ONE ECOSYSTEM v.2.4</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-bold tracking-widest text-[#10b981]">EQUIPMENT CONTROL</span>
        </div>
      </footer>
    </div>
  );
}