"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Edit2, Check, X, Layers, FileCheck } from "lucide-react";

// Используем твои общие UI компоненты
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProductType {
  id: string;
  name: string;
  hasMaterials: boolean;
  _count?: {
    products: number;
  };
}

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
    } catch (e) { alert("Ошибка сети."); }
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
    } catch (e) { alert("Ошибка сети"); }
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
    } catch (e) { alert("Ошибка сети"); }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-20">
      <div className="mx-auto max-w-[1100px] px-6 pt-10">
        
        {/* ХЕДЕР */}
        <header className="sticky top-6 z-40 mb-10 flex h-20 items-center justify-between rounded-full border border-slate-200 bg-white/90 px-8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-6">
            <Link href="/admin/products" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm hover:scale-110 transition-all">
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-purple-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Типы продуктов</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Форматы решений</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ФОРМА (Слева) */}
          <div className="lg:col-span-4">
            <section className="sticky top-32 rounded-[40px] border border-white bg-white p-8 shadow-xl">
              <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
                <Plus className="text-purple-500" size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#1e1b4b]">Новый тип</h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <Input
                  label="Название"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Напр: Чек-лист"
                  className="bg-slate-50 border-slate-200"
                />

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Готовые файлы</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      checked={newHasMaterials} 
                      onChange={(e) => setNewHasMaterials(e.target.checked)} 
                      className="peer sr-only" 
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                  </label>
                </div>

                <Button type="submit" isLoading={isCreating} className="w-full h-14 rounded-2xl">
                  Создать тип
                </Button>
              </form>
            </section>
          </div>

          {/* СПИСОК (Справа) */}
          <div className="lg:col-span-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Существующие типы ({types.length})
                </h3>
              </div>

              <div className="grid gap-4">
                {isLoading ? (
                  <div className="p-20 text-center font-black uppercase text-[10px] tracking-widest text-slate-300">Загрузка...</div>
                ) : types.map((type) => (
                  <div 
                    key={type.id} 
                    className={`group relative rounded-[32px] border transition-all p-6 backdrop-blur-sm
                      ${editingId === type.id 
                        ? "border-purple-300 bg-white shadow-lg ring-1 ring-purple-100" 
                        : "border-white bg-white/60 hover:bg-white hover:shadow-xl hover:-translate-y-1"}`}
                  >
                    {editingId === type.id ? (
                      <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                          <Input 
                            value={editingName} 
                            onChange={(e) => setEditingName(e.target.value)} 
                            className="bg-slate-50"
                          />
                          <div className="flex gap-2">
                            <button onClick={saveEditing} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all"><Check size={20} /></button>
                            <button onClick={() => setEditingId(null)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"><X size={20} /></button>
                          </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={editingHasMaterials} onChange={(e) => setEditingHasMaterials(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-purple-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Тип подразумевает загрузку готовых материалов</span>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                            ${type.hasMaterials ? "bg-emerald-50 text-emerald-500" : "bg-purple-50 text-purple-500"}`}>
                            {type.hasMaterials ? <FileCheck size={20} /> : <Layers size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-sm font-black text-[#1e1b4b] uppercase tracking-tight">{type.name}</h4>
                              {type.hasMaterials && (
                                <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-tighter">Материалы</span>
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Товаров: {type._count?.products || 0}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => startEditing(type)}
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1e1b4b] hover:text-white"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(type.id, type._count?.products || 0)}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all
                              ${(type._count?.products || 0) > 0 
                                ? "bg-slate-50 text-slate-200 cursor-not-allowed" 
                                : "bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}