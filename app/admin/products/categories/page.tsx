"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, Edit2, Trash2, Check, X, Layers } from "lucide-react";
import { Input } from "@/components/ui/Input";

const colorOptions = [
  { id: 'indigo', bg: 'bg-indigo-500', label: 'Индиго' },
  { id: 'black', bg: 'bg-slate-900', label: 'Черный' },
  { id: 'red', bg: 'bg-rose-500', label: 'Красный' },
  { id: 'green', bg: 'bg-[#10b981]', label: 'Зеленый' },
  { id: 'orange', bg: 'bg-orange-500', label: 'Оранж' },
];

const lightInput = "bg-gray-50 border-transparent focus:bg-white focus:border-[#10b981] text-[#111827] placeholder:text-gray-400 transition-all duration-300 rounded-xl px-4 py-3";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string; badgeColor?: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState("green");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editColor, setEditColor] = useState("green");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка загрузки");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async () => {
    if (!newName.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), badgeColor: selectedColor }),
      });
      if (res.ok) {
        setNewName("");
        setSelectedColor("green");
        await fetchCategories();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCategory = async (id: string) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/categories`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editValue.trim(), badgeColor: editColor }),
      });
      if (res.ok) {
        await fetchCategories();
        setEditingId(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Удалить эту категорию?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) await fetchCategories();
    } finally {
      setIsProcessing(false);
    }
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
            <h1 className="text-3xl font-light text-[#111827] tracking-tight">Категории</h1>
            <p className="text-sm text-gray-500 font-medium">Структура и группировка решений</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* ФОРМА ДОБАВЛЕНИЯ */}
        <section className="rounded-[2.5rem] bg-white p-8 shadow-soft border border-gray-100">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h2 className="text-lg font-bold text-[#111827]">Новая категория</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Название группы</label>
              <input 
                placeholder="Напр: ЭКОНОМИКА И ФИНАНСЫ"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={lightInput + " w-full"}
              />
            </div>
            
            <div className="flex flex-col gap-3 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Метка</span>
              <div className="flex gap-2.5 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    title={color.label}
                    onClick={() => setSelectedColor(color.id)}
                    className={`h-7 w-7 rounded-xl transition-all ${color.bg} ${selectedColor === color.id ? 'ring-2 ring-offset-2 ring-[#10b981] scale-110' : 'opacity-40 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={addCategory}
              disabled={isProcessing || !newName.trim()}
              className="h-[52px] px-10 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Создать
            </button>
          </div>
        </section>

        {/* СПИСОК КАТЕГОРИЙ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Активные категории ({categories.length})</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20 bg-white rounded-[2.5rem] shadow-soft border border-gray-100">
              <Loader2 className="animate-spin text-[#10b981]" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-transparent shadow-soft transition-all duration-300 hover:border-[#10b981]/30 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className={`h-2.5 w-10 rounded-full ${colorOptions.find(c => c.id === (editingId === cat.id ? editColor : cat.badgeColor))?.bg || 'bg-[#10b981]'}`} />
                    
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === cat.id ? (
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                          <X size={14} />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(cat.id); setEditValue(cat.name); setEditColor(cat.badgeColor || 'green'); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-[#ecfdf5] hover:text-[#10b981] transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    {editingId === cat.id ? (
                      <div className="space-y-4">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-gray-50 text-sm font-bold uppercase tracking-tight text-[#111827] border-b-2 border-[#10b981] outline-none p-2 rounded-t-lg"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1.5">
                            {colorOptions.map((color) => (
                              <button
                                key={color.id}
                                onClick={() => setEditColor(color.id)}
                                className={`h-5 w-5 rounded-lg ${color.bg} ${editColor === color.id ? 'ring-2 ring-offset-1 ring-gray-300' : 'opacity-40 hover:opacity-100'}`}
                              />
                            ))}
                          </div>
                          <button 
                            onClick={() => updateCategory(cat.id)} 
                            className="bg-[#10b981] text-white p-1.5 rounded-lg hover:bg-[#059669] transition-colors"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-[15px] font-bold uppercase tracking-tight text-[#111827] mb-1">
                          {cat.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                          ID: {cat.id.slice(-6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="col-span-full py-16 bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <Layers size={40} className="mb-3 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">Список пуст</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}