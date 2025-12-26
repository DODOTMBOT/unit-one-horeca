"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
  const [newIsAdmin, setNewIsAdmin] = useState(false);
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
        isAdmin: newIsAdmin, 
        order: items.length,
        parentId: newParentId 
      }),
    });
    if (res.ok) {
      setNewTitle(""); setNewHref(""); setNewIsAdmin(false); setNewParentId(null);
      fetchMenu();
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const currentItem = newItems[index];
    const targetItem = newItems[targetIndex];

    // Меняем order местами
    await handleUpdate(currentItem.id, { order: targetItem.order });
    await handleUpdate(targetItem.id, { order: currentItem.order });
  };

  const renderRow = (item: MenuItem, index: number, level: number = 0) => (
    <React.Fragment key={item.id}>
      <tr className={`group transition-colors ${level > 0 ? 'bg-slate-50/40' : 'bg-white'}`}>
        <td className="p-3 pl-5" style={{ paddingLeft: `${20 + level * 30}px` }}>
          <div className="flex items-center gap-2">
            {level === 0 && (
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveItem(index, 'up')} className="text-[10px] hover:text-blue-600">▲</button>
                <button onClick={() => moveItem(index, 'down')} className="text-[10px] hover:text-blue-600">▼</button>
              </div>
            )}
            <input 
              className="bg-transparent font-bold border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none px-1 w-full"
              defaultValue={item.title}
              onBlur={(e) => handleUpdate(item.id, { title: e.target.value })}
            />
          </div>
        </td>
        <td className="p-3">
          <input 
            className="bg-transparent text-xs text-slate-400 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none px-1 w-full"
            defaultValue={item.href || ""}
            placeholder="Без ссылки"
            onBlur={(e) => handleUpdate(item.id, { href: e.target.value || null })}
          />
        </td>
        <td className="p-3">
          <button 
            onClick={() => handleUpdate(item.id, { isAdmin: !item.isAdmin })}
            className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter transition ${
              item.isAdmin ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
            }`}
          >
            {item.isAdmin ? 'Admin Only' : 'All Users'}
          </button>
        </td>
        <td className="p-3 text-right pr-5">
          <button 
            onClick={async () => { if(confirm("Удалить?")) { await fetch(`/api/admin/menu?id=${item.id}`, { method: "DELETE" }); fetchMenu(); } }}
            className="text-slate-300 hover:text-red-500 transition-colors px-2"
          >
            ✕
          </button>
        </td>
      </tr>
      {item.children?.map((child, cIdx) => renderRow(child, cIdx, level + 1))}
    </React.Fragment>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
              ← Панель управления
            </Link>
            <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">Навигация сайта</h1>
          </div>
        </div>

        {/* Быстрая форма добавления */}
        <Card className="p-4 mb-6 border-0 shadow-sm bg-white rounded-2xl">
          <form onSubmit={handleAdd} className="flex flex-wrap md:flex-nowrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Название пункта</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full h-10 px-4 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Напр: Личный кабинет" required />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Ссылка (href)</label>
              <input value={newHref} onChange={e => setNewHref(e.target.value)} className="w-full h-10 px-4 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="/profile" />
            </div>
            <div className="w-[180px]">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Родитель</label>
              <select value={newParentId || ""} onChange={e => setNewParentId(e.target.value || null)} className="w-full h-10 px-3 bg-slate-50 border-0 rounded-xl text-sm outline-none cursor-pointer">
                <option value="">Корень меню</option>
                {items.filter(i => !i.parentId).map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 h-10 px-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer">
              <input type="checkbox" id="adm" checked={newIsAdmin} onChange={e => setNewIsAdmin(e.target.checked)} className="rounded text-blue-600 focus:ring-0" />
              <label htmlFor="adm" className="text-xs font-bold text-slate-600 cursor-pointer select-none whitespace-nowrap">Admin Only</label>
            </div>
            <Button type="submit" className="h-10 px-8 rounded-xl shadow-lg shadow-blue-500/20">Добавить</Button>
          </form>
        </Card>

        {/* Таблица */}
        <Card className="overflow-hidden border-0 shadow-sm bg-white rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="p-4 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Структура меню</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ссылка</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Доступ</th>
                <th className="p-4 text-right pr-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Действие</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400 animate-pulse font-bold">Загрузка структуры...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-bold tracking-tight">Меню пустое. Создайте первый пункт выше.</td></tr>
              ) : (
                items.map((item, idx) => renderRow(item, idx))
              )}
            </tbody>
          </table>
        </Card>
        
        <p className="mt-4 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          Совет: нажмите на текст или ссылку в таблице, чтобы изменить их на лету
        </p>
      </div>
    </div>
  );
}