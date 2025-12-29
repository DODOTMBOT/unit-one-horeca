"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Loader2, Plus, X, Search, Trash2, Edit3, ChevronDown, Check
} from "lucide-react";
import Link from "next/link";

// --- КАСТОМНЫЙ ВЫПАДАЮЩИЙ СПИСОК ---
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
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        // Убрали truncate, добавили flex-1 для текста, чтобы кнопка тянулась по высоте если надо
        className="w-full flex items-start justify-between bg-slate-50 border-transparent rounded-xl px-4 py-3 text-[11px] font-bold outline-none hover:bg-slate-100 transition-all text-left min-h-[44px]"
      >
        <span className={`flex-1 pr-2 leading-tight ${selectedOption ? "text-slate-800" : "text-slate-400"}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform mt-0.5 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-[250px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                // Заменили items-center на items-start для длинных строк и убрали truncate
                className="w-full flex items-start justify-between px-4 py-3 text-[11px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left border-b border-slate-50 last:border-0"
              >
                <span className="flex-1 pr-2 leading-snug">{opt.name}</span>
                {value === opt.id && <Check size={12} className="text-indigo-600 shrink-0 mt-0.5" />}
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
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ 
    name: "", 
    type: "Холодильное", 
    zone: "", 
    establishmentId: "" 
  });

  const fetchData = async () => {
    try {
      const [eqRes, estRes] = await Promise.all([
        fetch("/api/partner/equipment"),
        fetch("/api/establishments")
      ]);
      const eqData = await eqRes.json();
      const estData = await estRes.json();
      
      setEquipment(Array.isArray(eqData) ? eqData : []);
      setEstablishments(Array.isArray(estData) ? estData : []);
      if (estData.length > 0 && !form.establishmentId) {
        setForm(f => ({ ...f, establishmentId: estData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (eq: any) => {
    setEditingId(eq.id);
    setForm({
      name: eq.name,
      type: eq.type,
      zone: eq.zone || "",
      establishmentId: eq.establishmentId
    });
    setIsAdding(true);
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
        fetchData();
        setIsAdding(false);
        setEditingId(null);
        setForm({ ...form, name: "", zone: "", type: "Холодильное", establishmentId: establishments[0]?.id || "" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm("Удалить это оборудование?")) return;
    try {
      const res = await fetch(`/api/partner/equipment/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEquipment(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      alert("Ошибка при удалении");
    }
  };

  const filteredEq = equipment.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.establishment?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans text-[#1e1b4b]">
      <div className="max-w-[1000px] mx-auto px-6 pt-12">
        
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/partner" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Оборудование</h1>
            <span className="px-2 py-0.5 bg-indigo-50 rounded text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{equipment.length} ед.</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                placeholder="Поиск по названию..." 
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-500 w-[240px] transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                setIsAdding(!isAdding);
                if (isAdding) setEditingId(null);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${
                isAdding ? "bg-white border border-slate-200 text-slate-400" : "bg-[#1e1b4b] text-white hover:bg-indigo-600"
              }`}
            >
              {isAdding ? <X size={14} /> : <Plus size={14} />}
              {isAdding ? "Отмена" : "Добавить"}
            </button>
          </div>
        </header>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-10 bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-indigo-900/5 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-[10px] font-black uppercase text-indigo-600 mb-6 tracking-widest">
              {editingId ? "Редактирование устройства" : "Новое устройство"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Название</label>
                <input required className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:bg-white focus:ring-2 ring-indigo-500/10 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Холодильник напитки" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Зона установки</label>
                <input required className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:bg-white focus:ring-2 ring-indigo-500/10 transition-all" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} placeholder="Кухня / Бар" />
              </div>

              <CustomSelect 
                label="Тип"
                value={form.type}
                onChange={(val) => setForm({...form, type: val})}
                options={[
                  { id: "Холодильное", name: "Холодильное" },
                  { id: "Морозильное", name: "Морозильное" }
                ]}
              />

              <CustomSelect 
                label="Заведение"
                value={form.establishmentId}
                onChange={(val) => setForm({...form, establishmentId: val})}
                options={establishments.map(est => ({ 
                  id: est.id, 
                  name: `${est.name} (${est.address})` 
                }))}
                placeholder="Выбрать точку"
              />
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
              <button disabled={isSaving} className="bg-indigo-600 text-white px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : (editingId ? "Сохранить изменения" : "Зарегистрировать объект")}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 px-8 py-4 bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <div>Название</div>
            <div>Тип / Зона</div>
            <div>Заведение</div>
            <div className="text-right">Действия</div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredEq.map((eq) => (
                <div key={eq.id} className="grid grid-cols-4 items-center px-8 py-5 hover:bg-slate-50/30 transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black uppercase tracking-tight text-slate-800">{eq.name}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase mt-0.5">ID: {eq.id.slice(0,8)}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-indigo-500 uppercase">{eq.type}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{eq.zone || "Основная зона"}</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-600">{eq.establishment?.name}</span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(eq)}
                      className={`p-2.5 rounded-lg transition-all ${editingId === eq.id ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"}`}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteEquipment(eq.id)}
                      className="p-2.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}