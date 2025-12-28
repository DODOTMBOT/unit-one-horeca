"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Tag, Check, Edit2, Palette } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Цвета для бейджей, которые мы будем использовать в Marketplace
const colorOptions = [
  { id: 'indigo', bg: 'bg-indigo-500', label: 'Индиго' },
  { id: 'black', bg: 'bg-black', label: 'Черный' },
  { id: 'red', bg: 'bg-red-500', label: 'Красный' },
  { id: 'green', bg: 'bg-emerald-500', label: 'Зеленый' },
  { id: 'orange', bg: 'bg-orange-500', label: 'Оранж' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string; badgeColor?: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState("indigo");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editColor, setEditColor] = useState("indigo");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Не удалось загрузить список");
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
    setError("");

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
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка при добавлении");
      }
    } catch (err) {
      setError("Ошибка сети");
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
      } else {
        setError("Ошибка при обновлении");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Удалить эту категорию?")) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCategories();
      } else {
        setError("Не удалось удалить категорию");
      }
    } catch (err) {
      setError("Ошибка при удалении");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-20">
      <div className="mx-auto max-w-[1000px] px-6 pt-10">
        
        <header className="sticky top-6 z-40 mb-8 flex h-20 items-center justify-between rounded-full border border-slate-200 bg-white/90 px-8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/products/manage" 
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm hover:scale-110 transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-purple-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Категории</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Цвета и структура</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-white bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Plus className="text-purple-500" size={18} />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-[#1e1b4b]">Добавить новую</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <Input 
                    label="Название категории"
                    placeholder="Напр: Экономика и Деньги"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isProcessing}
                    className="bg-slate-50 border-slate-200 h-12"
                  />
                </div>
                <Button 
                  onClick={addCategory}
                  isLoading={isProcessing}
                  disabled={!newName.trim()}
                  className="rounded-xl h-[52px] min-w-[140px] text-[10px]"
                >
                  Добавить
                </Button>
              </div>

              {/* ВЫБОР ЦВЕТА ПРИ СОЗДАНИИ */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Palette size={12} /> Цвет бейджа на главной
                </span>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`h-8 w-8 rounded-full transition-all ${color.bg} ${selectedColor === color.id ? 'ring-4 ring-purple-200 scale-110' : 'opacity-60 hover:opacity-100'}`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className={`group flex flex-col rounded-2xl border transition-all p-4 ${editingId === cat.id ? "border-purple-300 bg-white shadow-md" : "border-white bg-white/60 hover:bg-white"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-colors 
                      ${colorOptions.find(c => c.id === (editingId === cat.id ? editColor : cat.badgeColor))?.bg || 'bg-indigo-500'}`}>
                      <Tag size={14} />
                    </div>
                    
                    <div className="flex-1 truncate">
                      {editingId === cat.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-transparent text-[13px] font-black text-[#1e1b4b] uppercase tracking-tight outline-none border-b border-purple-200"
                        />
                      ) : (
                        <h4 className="text-[13px] font-black text-[#1e1b4b] uppercase tracking-tight truncate">
                          {cat.name}
                        </h4>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {editingId === cat.id ? (
                      <button 
                        onClick={() => updateCategory(cat.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all"
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditValue(cat.name);
                            setEditColor(cat.badgeColor || 'indigo');
                          }}
                          className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="h-8 w-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ВЫБОР ЦВЕТА ПРИ РЕДАКТИРОВАНИИ */}
                {editingId === cat.id && (
                  <div className="flex gap-2 pt-2 border-t border-slate-50">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setEditColor(color.id)}
                        className={`h-5 w-5 rounded-full ${color.bg} ${editColor === color.id ? 'ring-2 ring-slate-300' : 'opacity-40 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}