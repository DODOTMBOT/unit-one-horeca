"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Shield, Plus, Loader2, ChevronLeft, Save, UserCog, Check, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PartnerRolesManagerPage() {
  const router = useRouter();
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
        fetch("/api/partner/roles"),
        fetch("/api/partner/roles/permissions")
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
      // АВТО-ВКЛЮЧЕНИЕ РОДИТЕЛЕЙ
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

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/partner/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName.toUpperCase() }),
      });
      if (res.ok) { setNewRoleName(""); loadData(); }
    } finally { setLoading(false); }
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const res = await fetch("/api/partner/roles/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: selectedRole.id, permissionIds: activePerms }),
      });
      if (res.ok) { alert("ДОСТУПЫ СОТРУДНИКОВ ОБНОВЛЕНЫ"); loadData(); }
    } finally { setLoading(false); }
  };

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
            <span className={`text-[11px] font-black leading-none uppercase ${isActive ? 'text-emerald-900' : 'text-slate-600'}`}>{node.description}</span>
            <span className="text-[8px] text-slate-300 mt-1 font-mono uppercase tracking-tighter">{node.name}</span>
          </div>
        </div>
        {children.map(child => <PermissionBranch key={child.id} node={child} level={level + 1} />)}
      </div>
    );
  };

  if (fetching) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 uppercase">
      <div className="max-w-[1400px] mx-auto px-6">
        <header className="flex justify-between items-center py-10">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center shadow-sm"><ChevronLeft /></button>
            <h1 className="text-2xl font-black tracking-tighter">ДОСТУПЫ ПЕРСОНАЛА</h1>
          </div>
          {selectedRole && <button onClick={savePermissions} disabled={loading} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg shadow-emerald-200 active:scale-95 transition-all">СОХРАНИТЬ</button>}
        </header>

        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-4 lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-soft">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <UserCog size={18} className="text-slate-400" />
                    <h2 className="text-[10px] font-black text-slate-400 tracking-widest">РОЛИ ОФИСА</h2>
                </div>
              {roles.map(role => (
                <button key={role.id} onClick={() => { setSelectedRole(role); setActivePerms(role.permissions.map((rp: any) => rp.permissionId)); }}
                  className={`w-full text-left p-4 mb-2 rounded-2xl text-[10px] font-black transition-all border ${selectedRole?.id === role.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}`}>
                  {role.name}
                </button>
              ))}
              
              <form onSubmit={handleCreateRole} className="mt-6 pt-6 border-t border-slate-50 flex gap-2">
                <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="НАЗВАНИЕ..." className="flex-1 bg-slate-50 rounded-xl px-4 text-[10px] font-black outline-none focus:bg-white border border-transparent focus:border-emerald-500 transition-all" />
                <button type="submit" className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0"><Plus size={18} /></button>
              </form>
            </div>
          </aside>

          <main className="col-span-8 lg:col-span-9">
            {selectedRole ? (
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-soft">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><Shield size={20} /></div>
                  <h2 className="text-xl font-black text-slate-900 uppercase">ПРАВА ДЛЯ {selectedRole.name}</h2>
                </div>
                <div className="flex flex-col">
                  {permissions
                    .filter(p => !p.parentId)
                    .map(rootNode => <PermissionBranch key={rootNode.id} node={rootNode} level={0} />)}
                </div>
              </div>
            ) : <div className="h-[500px] bg-white rounded-[3rem] border-dashed border-2 flex flex-col items-center justify-center text-slate-300 font-black gap-4">
                  <LayoutGrid size={48} strokeWidth={1} />
                  <span>ВЫБЕРИТЕ РОЛЬ СЛЕВА ДЛЯ НАСТРОЙКИ МАТРИЦЫ</span>
                </div>}
          </main>
        </div>
      </div>
    </div>
  );
}