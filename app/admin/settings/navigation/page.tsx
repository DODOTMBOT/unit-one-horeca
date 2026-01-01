"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Loader2, Trash2, GripVertical, CornerDownRight, Save, Navigation } from "lucide-react";

interface MenuItem {
  id: string;
  title: string;
  href: string | null;
  order: number;
  isAdmin: boolean;
  isVisible: boolean;
  parentId: string | null;
  children?: MenuItem[];
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState("");
  const [newHref, setNewHref] = useState("");
  const [newParentId, setNewParentId] = useState<string | null>(null);

  const fetchMenu = async () => {
    const res = await fetch("/api/admin/menu");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleUpdate = async (id: string, data: Partial<MenuItem>) => {
    // Оптимистичное обновление UI (можно добавить, но пока просто запрос)
    await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    fetchMenu();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: newTitle, 
        href: newHref, 
        isAdmin: false, 
        order: items.length,
        parentId: newParentId 
      }),
    });
    if (res.ok) {
      setNewTitle(""); setNewHref(""); setNewParentId(null);
      fetchMenu();
    }
  };

  const renderRow = (item: MenuItem, index: number, level: number = 0) => (
    <React.Fragment key={item.id}>
      <div className="group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
        
        {/* LEFT: Title & Structure */}
        <div className="flex items-center gap-4 flex-1" style={{ paddingLeft: `${level * 32}px` }}>
          <div className="text-gray-300 cursor-grab active:cursor-grabbing p-1">
            {level > 0 ? <CornerDownRight size={16} /> : <GripVertical size={16} />}
          </div>
          
          <div className="flex-1">
            <input 
              className="w-full bg-transparent font-bold text-[#111827] text-sm border-b border-transparent focus:border-[#10b981] focus:outline-none transition-colors placeholder-gray-300 py-1"
              defaultValue={item.title}
              onBlur={(e) => handleUpdate(item.id, { title: e.target.value })}
              placeholder="Название пункта"
            />
          </div>
        </div>

        {/* MIDDLE: Link */}
        <div className="flex-1 px-4 hidden sm:block">
          <input 
            className="w-full bg-transparent font-mono text-xs text-gray-500 border-b border-transparent focus:border-[#10b981] focus:outline-none transition-colors placeholder-gray-300 py-1"
            defaultValue={item.href || ""}
            placeholder="/"
            onBlur={(e) => handleUpdate(item.id, { href: e.target.value || null })}
          />
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 pl-4">
          <button 
            onClick={async () => { if(confirm("Удалить этот пункт?")) { await fetch(`/api/admin/menu?id=${item.id}`, { method: "DELETE" }); fetchMenu(); } }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Recursion for children */}
      {item.children?.map((child, cIdx) => renderRow(child, cIdx, level + 1))}
    </React.Fragment>
  );

  return (
    <div className="flex flex-col gap-10 pb-20">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight">
              Навигация
            </h1>
            <p className="text-gray-500 font-medium mt-2 ml-1">
              Структура главного меню сайта
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Create Form */}
        <div className="xl:col-span-1 bg-white p-6 rounded-[2.5rem] shadow-soft sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h2 className="text-lg font-bold text-[#111827]">Добавить пункт</h2>
          </div>

          <form onSubmit={handleAdd} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Название</label>
              <input 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-3 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-gray-400" 
                placeholder="Например: О компании" 
                required 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Ссылка</label>
              <input 
                value={newHref} 
                onChange={e => setNewHref(e.target.value)} 
                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-3 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-gray-400" 
                placeholder="/about" 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Родительский пункт</label>
              <select 
                value={newParentId || ""} 
                onChange={e => setNewParentId(e.target.value || null)} 
                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-3 text-sm font-medium text-[#111827] outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="">-- Корневой пункт --</option>
                {items.filter(i => !i.parentId).map(i => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="mt-2 w-full px-6 py-3 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/20"
            >
              Добавить
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Menu Tree */}
        <div className="xl:col-span-2">
          {loading ? (
             <div className="bg-white p-12 rounded-[2.5rem] shadow-soft flex justify-center">
               <Loader2 className="animate-spin text-[#10b981]" size={32} />
             </div>
          ) : items.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] shadow-soft text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation size={24} />
              </div>
              <p className="text-gray-400 font-medium">Меню пока пустое</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-soft overflow-hidden border border-gray-100">
              <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Структура</span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 hidden sm:block pr-32">Ссылка</span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Действия</span>
              </div>
              
              <div className="flex flex-col">
                {items.map((item, idx) => renderRow(item, idx))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}