"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

// Твои UI компоненты
import { Input } from "@/components/ui/Input";

interface ProductType {
  id: string;
  name: string;
  hasMaterials: boolean;
  _count?: {
    products: number;
  };
}

const lightInput = "bg-slate-50 border-slate-100 text-[#1e1b4b] placeholder:text-slate-400 focus:bg-white focus:border-[#7171a7] transition-all duration-300";

export default function AdminTypesPage() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newTypeName, setNewTypeName] = useState("");
  const [newHasMaterials, setNewHasMaterials] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingHasMaterials, setEditingHasMaterials] = useState(false);

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/admin/types");
      if (res.ok) {
        const data = await res.json();
        setTypes(data);
      }
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName, hasMaterials: newHasMaterials }),
      });
      if (res.ok) {
        setNewTypeName("");
        setNewHasMaterials(false);
        fetchTypes();
      }
    } catch (e) { console.error(e); }
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      alert(`Нельзя удалить: этот тип используется в ${count} товарах.`);
      return;
    }
    if (!confirm("Точно удалить этот тип?")) return;
    try {
      const res = await fetch(`/api/admin/types/${id}`, { method: "DELETE" });
      if (res.ok) fetchTypes();
    } catch (e) { console.error(e); }
  };

  const startEditing = (type: ProductType) => {
    setEditingId(type.id);
    setEditingName(type.name);
    setEditingHasMaterials(type.hasMaterials);
  };

  const saveEditing = async () => {
    if (!editingId || !editingName.trim()) return;
    try {
      const res = await fetch(`/api/admin/types/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName, hasMaterials: editingHasMaterials }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchTypes();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/admin/products" 
              className="group flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Типы продуктов
            </h1>
          </div>

          <div className="flex-1 hidden md:flex" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ФОРМА СОЗДАНИЯ */}
          <div className="lg:col-span-4">
            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-10">
              <div className="mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Новый формат</h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <Input
                  label="Название"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="НАПР: ЧЕК-ЛИСТ"
                  className={lightInput}
                />

                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Готовые файлы</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      checked={newHasMaterials} 
                      onChange={(e) => setNewHasMaterials(e.target.checked)} 
                      className="peer sr-only" 
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#1e1b4b] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isCreating || !newTypeName.trim()} 
                  className="w-full h-14 bg-[#1e1b4b] text-white rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest hover:bg-[#7171a7] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : "Создать тип"}
                </button>
              </form>
            </section>
          </div>

          {/* СПИСОК СУЩЕСТВУЮЩИХ */}
          <div className="lg:col-span-8">
            <div className="mb-8 pl-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Существующие форматы</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-full py-20 text-center">
                   <Loader2 size={32} className="animate-spin inline text-slate-200" />
                </div>
              ) : types.map((type) => (
                <div 
                  key={type.id} 
                  className="group relative flex flex-col p-8 rounded-[2rem] border border-slate-100 bg-white transition-all duration-300 hover:border-[#7171a7]"
                >
                  {editingId === type.id ? (
                    <div className="space-y-6">
                      <Input 
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)} 
                        className={lightInput}
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={editingHasMaterials} onChange={(e) => setEditingHasMaterials(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#1e1b4b] focus:ring-0" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Материалы</span>
                        </label>
                        <div className="flex gap-2">
                           <button onClick={saveEditing} className="text-[9px] font-black uppercase text-emerald-500">OK</button>
                           <button onClick={() => setEditingId(null)} className="text-[9px] font-black uppercase text-slate-300">ESC</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${type.hasMaterials ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                           {type.hasMaterials ? 'Файловый' : 'Услуга'}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditing(type)} className="text-[9px] font-black uppercase text-slate-300 hover:text-[#7171a7]">Edit</button>
                          <button 
                            onClick={() => handleDelete(type.id, type._count?.products || 0)} 
                            className={`text-[9px] font-black uppercase ${(type._count?.products || 0) > 0 ? 'text-slate-100 cursor-not-allowed' : 'text-slate-300 hover:text-rose-500'}`}
                          >
                            Del
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-black uppercase tracking-tight text-[#1e1b4b] mb-2">{type.name}</h4>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-auto">Товаров: {type._count?.products || 0}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-50 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-200">
          <p>Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-emerald-500/50 tracking-widest">Конфигурация типов активна</span>
          </div>
        </div>
      </div>
    </div>
  );
}