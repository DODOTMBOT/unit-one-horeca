"use client";

import { useState, useEffect } from "react";
import { 
  Store, MapPin, Plus, X, Loader2, ArrowLeft, 
  Users, ChevronRight, Search, Hash, Globe
} from "lucide-react";
import Link from "next/link";

export default function PartnerEstablishments() {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ name: "", city: "", address: "" });

  useEffect(() => {
    fetch("/api/establishments")
      .then(res => res.json())
      .then(data => {
        setEstablishments(data);
        setLoading(false);
      });
  }, []);

  const filteredEst = establishments.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.city.toLowerCase().includes(search.toLowerCase())
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
        const newEst = await res.json();
        setEstablishments([newEst, ...establishments]);
        setIsAdding(false);
        setForm({ name: "", city: "", address: "" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 pt-12">
        
        {/* HEADER: Ультра-компактный */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/partner" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#1e1b4b] transition-all">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tighter text-[#1e1b4b]">Реестр объектов</h1>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">{establishments.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                placeholder="Поиск по названию или городу..." 
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-500 w-[250px] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1e1b4b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md shadow-indigo-900/10"
            >
              {isAdding ? <X size={14} /> : <Plus size={14} />}
              {isAdding ? "Отмена" : "Добавить"}
            </button>
          </div>
        </header>

        {/* COMPACT FORM: Горизонтальная строка */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col md:flex-row gap-3 animate-in fade-in slide-in-from-top-2">
            <input required placeholder="Название" className="flex-1 bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none focus:ring-2 ring-indigo-500/10" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input required placeholder="Город" className="w-full md:w-[150px] bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none focus:ring-2 ring-indigo-500/10" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            <input required placeholder="Адрес" className="flex-[1.5] bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none focus:ring-2 ring-indigo-500/10" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <button disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : "Создать"}
            </button>
          </form>
        )}

        {/* TABLE-LIKE LIST */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          {/* Header Row */}
          <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400">
            <div className="w-8 flex justify-center"><Hash size={10} /></div>
            <div className="flex-[2]">Наименование заведения</div>
            <div className="flex-1">Локация</div>
            <div className="flex-1">Штат</div>
            <div className="w-[100px] text-right">Действие</div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <p className="text-[9px] font-black uppercase text-slate-300">Загрузка реестра...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredEst.map((est, idx) => (
                <div key={est.id} className="group flex flex-col md:flex-row md:items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {/* # */}
                  <div className="hidden md:flex w-8 justify-center text-[10px] font-bold text-slate-300 group-hover:text-indigo-500 transition-colors">
                    {idx + 1}
                  </div>

                  {/* Name */}
                  <div className="flex-[2] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                      <Store size={14} />
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-tight text-[#1e1b4b] truncate">
                      {est.name}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex-1 flex items-center gap-2">
                    <MapPin size={12} className="text-slate-300 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase truncate">
                      {est.city}, {est.address}
                    </span>
                  </div>

                  {/* Staff */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <Users size={12} />
                    </div>
                    <span className="text-[10px] font-black text-[#1e1b4b]">
                      {est.employees?.length || 0} <span className="text-slate-300 ml-0.5">чел.</span>
                    </span>
                  </div>

                  {/* Action */}
                  <div className="w-full md:w-[100px] flex justify-end">
                    <Link 
                      href={`/partner/staff`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      Управление <ChevronRight size={10} />
                    </Link>
                  </div>
                </div>
              ))}

              {filteredEst.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Ничего не найдено</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}