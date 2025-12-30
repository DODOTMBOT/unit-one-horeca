"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Loader2, Trash2, MoveVertical } from "lucide-react";

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
        isAdmin: false, // Теперь по умолчанию false, так как проверка идет через роли
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
      <tr className={`group transition-all ${level > 0 ? 'bg-slate-50/30' : 'bg-white'}`}>
        <td className="p-5" style={{ paddingLeft: `${24 + level * 32}px` }}>
          <div className="flex items-center gap-3">
            <MoveVertical size={14} className="text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            <input 
              className="bg-transparent font-black uppercase tracking-tight text-sm text-[#1e1b4b] border-b border-transparent focus:border-[#7171a7] focus:outline-none w-full"
              defaultValue={item.title}
              onBlur={(e) => handleUpdate(item.id, { title: e.target.value })}
            />
          </div>
        </td>
        <td className="p-5">
          <input 
            className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-transparent focus:border-[#7171a7] focus:outline-none w-full"
            defaultValue={item.href || ""}
            placeholder="ССЫЛКА НЕ УКАЗАНА"
            onBlur={(e) => handleUpdate(item.id, { href: e.target.value || null })}
          />
        </td>
        <td className="p-5 text-right pr-10">
          <button 
            onClick={async () => { if(confirm("Удалить этот пункт?")) { await fetch(`/api/admin/menu?id=${item.id}`, { method: "DELETE" }); fetchMenu(); } }}
            className="w-8 h-8 inline-flex items-center justify-center text-slate-200 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
      {item.children?.map((child, cIdx) => renderRow(child, cIdx, level + 1))}
    </React.Fragment>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1200px] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <Link 
              href="/admin/settings" 
              className="group flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-white border border-slate-100 transition-all hover:scale-105"
            >
              <ChevronLeft size={20} className="text-slate-400 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-12 py-3 bg-white border border-slate-100 rounded-full">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 leading-none">
              Навигация сайта
            </h1>
          </div>

          <div className="flex-1" />
        </div>

        {/* ФОРМА ДОБАВЛЕНИЯ */}
        <section className="bg-white rounded-[2rem] p-10 border border-slate-100 mb-10 transition-all hover:border-[#7171a7]">
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Создать новый пункт меню</p>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full h-14 px-6 bg-slate-50/50 border border-transparent rounded-[1.2rem] text-sm font-bold focus:bg-white focus:border-[#7171a7] outline-none transition-all" placeholder="НАЗВАНИЕ" required />
            </div>
            <div className="md:col-span-1">
              <input value={newHref} onChange={e => setNewHref(e.target.value)} className="w-full h-14 px-6 bg-slate-50/50 border border-transparent rounded-[1.2rem] text-sm font-bold focus:bg-white focus:border-[#7171a7] outline-none transition-all" placeholder="ССЫЛКА (/...)" />
            </div>
            <div className="md:col-span-1">
              <select value={newParentId || ""} onChange={e => setNewParentId(e.target.value || null)} className="w-full h-14 px-4 bg-slate-50/50 border border-transparent rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                <option value="">КОРЕНЬ МЕНЮ</option>
                {items.filter(i => !i.parentId).map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
              </select>
            </div>
            <button type="submit" className="h-14 bg-[#1e1b4b] text-white rounded-[1.2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all">
              Добавить
            </button>
          </form>
        </section>

        {/* ТАБЛИЦА */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all hover:border-[#7171a7]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="p-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] w-1/2">Структура</th>
                <th className="p-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] w-1/3">Адрес</th>
                <th className="p-6 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pr-10">Действие</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-20 text-center"><Loader2 className="animate-spin inline text-slate-200" size={32} /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={3} className="p-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">Меню не сформировано</td></tr>
              ) : (
                items.map((item, idx) => renderRow(item, idx))
              )}
            </tbody>
          </table>
        </section>
        
        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-50 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-200">
          <p>Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-emerald-500/50 tracking-widest">Конфигурация навигации</span>
          </div>
        </div>
      </div>
    </div>
  );
}