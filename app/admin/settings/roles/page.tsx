"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Shield, Plus, Loader2, ChevronLeft, Save, UserCog, Check, ChevronDown, ChevronRight } from "lucide-react";

export default function RolesManagerPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activePerms, setActivePerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newRoleName, setNewRoleName] = useState("");

  const loadData = useCallback(async () => {
    try {
      setFetching(true);
      const [rRes, pRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/roles/permissions")
      ]);
      if (rRes.ok && pRes.ok) {
        setRoles(await rRes.json());
        setPermissions(await pRes.json());
      }
    } catch (e) { console.error(e); } finally { setFetching(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const togglePermission = (node: any) => {
    let newSelection = [...activePerms];
    const isActivating = !newSelection.includes(node.id);

    if (isActivating) {
      newSelection.push(node.id);
      // АВТО-ВКЛЮЧЕНИЕ РОДИТЕЛЕЙ (MotherId)
      let current = node;
      while (current.parentId) {
        const parent = permissions.find(p => p.id === current.parentId);
        if (parent && !newSelection.includes(parent.id)) {
          newSelection.push(parent.id);
          current = parent;
        } else break;
      }
    } else {
      // АВТО-ВЫКЛЮЧЕНИЕ ВСЕХ ДЕТЕЙ
      const getAllChildrenIds = (id: string): string[] => {
        const children = permissions.filter(p => p.parentId === id);
        return children.reduce((acc, child) => [...acc, child.id, ...getAllChildrenIds(child.id)], [] as string[]);
      };
      const toRemove = [node.id, ...getAllChildrenIds(node.id)];
      newSelection = newSelection.filter(id => !toRemove.includes(id));
    }
    setActivePerms(newSelection);
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: selectedRole.id, permissionIds: activePerms }),
      });
      if (res.ok) { alert("СТРУКТУРА ОБНОВЛЕНА"); loadData(); }
    } finally { setLoading(false); }
  };

  // Рекурсивный компонент ветки
  const PermissionBranch = ({ node, level = 0 }: { node: any, level: number }) => {
    const children = permissions.filter(p => p.parentId === node.id);
    const isActive = activePerms.includes(node.id);

    return (
      <div className="flex flex-col w-full">
        <div 
          onClick={() => togglePermission(node)}
          className={`flex items-center gap-4 p-4 rounded-2xl border mb-2 cursor-pointer transition-all ${
            isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
          style={{ marginLeft: level * 32 }}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-[#10b981] text-white shadow-md' : 'bg-slate-50 text-slate-300'}`}>
            {isActive ? <Check size={14} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-black leading-none ${isActive ? 'text-emerald-900' : 'text-slate-600'}`}>{node.description}</span>
            <span className="text-[8px] text-slate-300 mt-1 font-mono uppercase">{node.name}</span>
          </div>
        </div>
        {children.map(child => <PermissionBranch key={child.id} node={child} level={level + 1} />)}
      </div>
    );
  };

  const roots = useMemo(() => {
    const roleName = selectedRole?.name?.toUpperCase();
    const isOwner = roleName === 'OWNER' || roleName === 'ADMIN';

    return [
      { id: 'admin', title: 'ADMIN PANEL STRUCTURE', category: 'admin' },
      { id: 'partner', title: 'PARTNER PANEL STRUCTURE', category: 'partner' }
    ].filter(g => isOwner || g.category === 'partner');
  }, [selectedRole]);

  if (fetching) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 uppercase">
      <div className="max-w-[1400px] mx-auto px-6">
        <header className="flex justify-between items-center py-10">
          <div className="flex items-center gap-6">
            <Link href="/admin/settings" className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center shadow-sm"><ChevronLeft /></Link>
            <h1 className="text-2xl font-black tracking-tighter">ИЕРАРХИЯ ДОСТУПОВ</h1>
          </div>
          {selectedRole && <button onClick={savePermissions} disabled={loading} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg shadow-emerald-200 active:scale-95 transition-all">СОХРАНИТЬ</button>}
        </header>

        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-3">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-soft">
              <h2 className="text-[10px] font-black mb-6 px-2 text-slate-400 tracking-widest">СПИСОК РОЛЕЙ</h2>
              {roles.map(role => (
                <button key={role.id} onClick={() => { setSelectedRole(role); setActivePerms(role.permissions.map((rp: any) => rp.permissionId)); }}
                  className={`w-full text-left p-4 mb-2 rounded-2xl text-[10px] font-black transition-all border ${selectedRole?.id === role.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}`}>
                  {role.name}
                </button>
              ))}
            </div>
          </aside>

          <main className="col-span-9 space-y-10">
            {selectedRole ? roots.map(group => (
              <div key={group.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-soft">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><Shield size={20} /></div>
                  <h2 className="text-xl font-black text-slate-900">{group.title}</h2>
                </div>
                <div className="flex flex-col">
                  {permissions
                    .filter(p => p.category === group.category && !p.parentId)
                    .map(rootNode => <PermissionBranch key={rootNode.id} node={rootNode} level={0} />)}
                </div>
              </div>
            )) : <div className="h-[500px] bg-white rounded-[3rem] border-dashed border-2 flex items-center justify-center text-slate-300 font-black">ВЫБЕРИТЕ РОЛЬ СЛЕВА</div>}
          </main>
        </div>
      </div>
    </div>
  );
}