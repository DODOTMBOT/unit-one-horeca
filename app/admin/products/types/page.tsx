"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, Edit2, Trash2, Check, X, Tags } from "lucide-react";

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

const lightInput = "bg-gray-50 border-transparent focus:bg-white focus:border-[#10b981] text-[#111827] placeholder:text-gray-400 transition-all duration-300 rounded-xl px-4 py-3";

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
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-[#111827] tracking-tight">Типы продуктов</h1>
            <p className="text-sm text-gray-500 font-medium">Форматы реализации решений</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* ФОРМА СОЗДАНИЯ */}
        <div className="lg:col-span-4 sticky top-6">
          <section className="rounded-[2.5rem] bg-white p-8 shadow-soft border border-gray-100">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
                <Plus size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#111827]">Новый формат</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <Input
                label="Название формата"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Напр: ЧЕК-ЛИСТ"
                className={lightInput}
              />

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Готовые файлы</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    checked={newHasMaterials} 
                    onChange={(e) => setNewHasMaterials(e.target.checked)} 
                    className="peer sr-only" 
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#10b981] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isCreating || !newTypeName.trim()} 
                className="w-full h-[52px] bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : "Создать тип"}
              </button>
            </form>
          </section>
        </div>

        {/* СПИСОК СУЩЕСТВУЮЩИХ */}
        <div className="lg:col-span-8 space-y-6">
          <div className="px-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Существующие форматы ({types.length})</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] shadow-soft border border-gray-100">
                 <Loader2 size={32} className="animate-spin inline text-[#10b981]" />
              </div>
            ) : types.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                <Tags size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Список пуст</p>
              </div>
            ) : (
              types.map((type) => (
                <div 
                  key={type.id} 
                  className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-transparent shadow-soft transition-all duration-300 hover:border-[#10b981]/30 hover:shadow-xl"
                >
                  {editingId === type.id ? (
                    <div className="space-y-4">
                      <input 
                        autoFocus
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)} 
                        className="w-full bg-gray-50 text-sm font-bold uppercase tracking-tight text-[#111827] border-b-2 border-[#10b981] outline-none p-2 rounded-t-lg"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editingHasMaterials} onChange={(e) => setEditingHasMaterials(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#10b981] focus:ring-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Материалы</span>
                        </label>
                        <div className="flex gap-2">
                           <button onClick={saveEditing} className="p-1.5 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors">
                              <Check size={14} />
                           </button>
                           <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-200 transition-colors">
                              <X size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-5">
                        <div className={`text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${type.hasMaterials ? 'bg-[#ecfdf5] text-[#10b981] border border-[#d1fae5]' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                           {type.hasMaterials ? 'С материалами' : 'Без материалов'}
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditing(type)} className="p-1.5 rounded-lg text-gray-400 hover:bg-[#ecfdf5] hover:text-[#10b981] transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button 
                            disabled={(type._count?.products || 0) > 0}
                            onClick={() => handleDelete(type.id, type._count?.products || 0)} 
                            className={`p-1.5 rounded-lg transition-colors ${(type._count?.products || 0) > 0 ? 'text-gray-100 cursor-not-allowed' : 'text-gray-400 hover:bg-rose-50 hover:text-rose-500'}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-[15px] font-bold uppercase tracking-tight text-[#111827] mb-1">{type.name}</h4>
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.1em] mt-auto">Товаров в базе: {type._count?.products || 0}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}