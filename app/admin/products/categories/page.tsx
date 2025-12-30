"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";

const colorOptions = [
  { id: 'indigo', bg: 'bg-indigo-500', label: 'Индиго' },
  { id: 'black', bg: 'bg-black', label: 'Черный' },
  { id: 'red', bg: 'bg-red-500', label: 'Красный' },
  { id: 'green', bg: 'bg-emerald-500', label: 'Зеленый' },
  { id: 'orange', bg: 'bg-orange-500', label: 'Оранж' },
];

const lightInput = "bg-slate-50 border-slate-100 text-[#1e1b4b] placeholder:text-slate-400 focus:bg-white focus:border-[#7171a7] transition-all duration-300";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string; badgeColor?: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState("indigo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editColor, setEditColor] = useState("indigo");

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
        setSelectedColor("indigo");
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
              Категории
            </h1>
          </div>

          <div className="flex-1 hidden md:flex" />
        </div>

        <div className="grid grid-cols-1 gap-8">
          
          {/* ФОРМА ДОБАВЛЕНИЯ */}
          <section className="rounded-[2.5rem] border border-slate-100 bg-white p-10">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Новая категория</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <Input 
                  label="Название"
                  placeholder="ЭКОНОМИКА И ДЕНЬГИ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={lightInput}
                />
              </div>
              
              <div className="flex flex-col gap-3 pb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Цвет бейджа</span>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`h-8 w-8 rounded-xl transition-all ${color.bg} ${selectedColor === color.id ? 'ring-4 ring-slate-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={addCategory}
                disabled={isProcessing || !newName.trim()}
                className="h-14 px-12 bg-[#1e1b4b] text-white rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest hover:bg-[#7171a7] transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Создать"}
              </button>
            </div>
          </section>

          {/* СПИСОК КАТЕГОРИЙ */}
          <section>
            <div className="mb-8 pl-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Список активных</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-slate-200" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <div 
                    key={cat.id}
                    className="group relative flex flex-col p-8 rounded-[2rem] border border-slate-100 bg-white transition-all duration-300 hover:border-[#7171a7]"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-8 h-2 rounded-full ${colorOptions.find(c => c.id === (editingId === cat.id ? editColor : cat.badgeColor))?.bg || 'bg-indigo-500'}`} />
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingId === cat.id ? (
                          <button onClick={() => updateCategory(cat.id)} className="text-[9px] font-black uppercase text-emerald-500 hover:text-emerald-700">OK</button>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(cat.id); setEditValue(cat.name); setEditColor(cat.badgeColor || 'indigo'); }} className="text-[9px] font-black uppercase text-slate-300 hover:text-[#7171a7]">Edit</button>
                            <button onClick={() => deleteCategory(cat.id)} className="text-[9px] font-black uppercase text-slate-300 hover:text-rose-500">Del</button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      {editingId === cat.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-transparent text-sm font-black uppercase tracking-tight text-[#1e1b4b] border-b border-[#7171a7] outline-none"
                        />
                      ) : (
                        <h4 className="text-sm font-black uppercase tracking-tight text-[#1e1b4b] truncate">
                          {cat.name}
                        </h4>
                      )}
                    </div>

                    {editingId === cat.id && (
                      <div className="flex gap-1.5 mt-5 pt-4 border-t border-slate-50">
                        {colorOptions.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setEditColor(color.id)}
                            className={`h-4 w-4 rounded-md ${color.bg} ${editColor === color.id ? 'ring-2 ring-slate-200' : 'opacity-40 hover:opacity-100'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-50 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-200">
          <p>Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-emerald-500/50 tracking-widest text-[8px]">Конфигурация активна</span>
          </div>
        </div>
      </div>
    </div>
  );
}