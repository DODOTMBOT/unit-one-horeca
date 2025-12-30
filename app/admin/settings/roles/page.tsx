"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Shield, Plus, Loader2, ChevronRight, 
  Save, Lock, CheckCircle2, ChevronLeft,
  Layout
} from "lucide-react";

export default function RolesManagerPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activePerms, setActivePerms] = useState<string[]>([]);
  
  const [newRoleName, setNewRoleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/roles/permissions")
      ]);
      const rData = await rRes.json();
      const pData = await pRes.json();
      setRoles(rData);
      setPermissions(pData);
    } catch (e) {
      console.error("Ошибка загрузки", e);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName.toUpperCase() }),
      });
      if (res.ok) {
        setNewRoleName("");
        await loadData();
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (perm: any) => {
    let newSelection = [...activePerms];
    if (newSelection.includes(perm.id)) {
      newSelection = newSelection.filter(id => id !== perm.id);
    } else {
      newSelection.push(perm.id);
      const parts = perm.name.split('/');
      if (parts.length > 2) {
        const parentPath = `/${parts[1]}`;
        const parent = permissions.find(p => p.name === parentPath);
        if (parent && !newSelection.includes(parent.id)) {
          newSelection.push(parent.id);
        }
      }
    }
    setActivePerms(newSelection);
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roleId: selectedRole.id, 
          permissionIds: activePerms 
        }),
      });
      if (res.ok) alert("Доступы обновлены!");
    } finally {
      setLoading(false);
    }
  };

  const parentPaths = permissions.filter(p => p.name.split('/').length === 2);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER (Сжатый) */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <Link 
              href="/admin/settings" 
              className="group flex h-10 w-10 items-center justify-center rounded-[1rem] bg-white border border-slate-100 transition-all hover:scale-105"
            >
              <ChevronLeft size={18} className="text-slate-400 group-hover:text-[#7171a7]" />
            </Link>
          </div>
          <div className="px-8 py-2.5 bg-white border border-slate-100 rounded-full">
            <h1 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Управление ролями
            </h1>
          </div>
          <div className="flex-1" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100">
              <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4 flex items-center gap-2">
                <Plus size={10} /> Новая роль
              </h2>
              <form onSubmit={handleCreateRole} className="flex gap-2">
                <input 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="НАЗВАНИЕ..."
                  className="flex-1 bg-slate-50/50 border border-transparent rounded-[1rem] px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-[#7171a7] transition-all"
                />
                <button disabled={loading} className="bg-[#1e1b4b] text-white w-12 h-12 rounded-[1rem] flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-50 bg-slate-50/20">
                <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">Список ролей</h2>
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {fetching ? (
                  <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-100" /></div>
                ) : roles.map((role) => (
                  <button 
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setActivePerms(role.permissions?.map((p: any) => p.permissionId) || []);
                    }}
                    className={`w-full flex items-center justify-between p-4 transition-all ${selectedRole?.id === role.id ? 'bg-slate-50/80' : 'hover:bg-slate-50/30'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[9px] uppercase ${selectedRole?.id === role.id ? 'bg-[#1e1b4b] text-white' : 'bg-slate-50 text-slate-300'}`}>
                        {role.name.substring(0, 2)}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{role.name}</span>
                    </div>
                    {selectedRole?.id === role.id && <ChevronRight size={12} className="text-[#7171a7]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (Компактная) */}
          <div className="col-span-12 lg:col-span-8">
            {selectedRole ? (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 min-h-[500px]">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-[#1e1b4b]">Доступы к страницам</h2>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                      Настройка: <span className="text-indigo-500">{selectedRole.name}</span>
                    </p>
                  </div>
                  <button 
                    onClick={savePermissions}
                    disabled={loading}
                    className="bg-[#1e1b4b] text-white px-8 py-3.5 rounded-[1.2rem] flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">Сохранить</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {parentPaths.map((parent) => (
                    <div key={parent.id} className="group">
                      {/* ГЛАВНЫЙ ПУТЬ (Сжат) */}
                      <div 
                        onClick={() => togglePermission(parent)}
                        className={`flex items-center gap-4 p-4 rounded-[1.2rem] cursor-pointer transition-all border ${activePerms.includes(parent.id) ? 'bg-[#1e1b4b] border-[#1e1b4b] text-white' : 'bg-white border-slate-100 text-slate-300 hover:border-[#7171a7]'}`}
                      >
                        {activePerms.includes(parent.id) ? <CheckCircle2 size={16} /> : <Layout size={16} className="opacity-20" />}
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">{parent.name}</span>
                        <span className="ml-auto text-[8px] opacity-40 font-black uppercase tracking-widest">{parent.description || 'Global'}</span>
                      </div>

                      {/* ПОДПУТИ (Сетка из 3 колонок) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 ml-6 pl-6 border-l border-slate-50">
                        {permissions
                          .filter(p => p.name.startsWith(parent.name + '/') && p.id !== parent.id)
                          .map((child) => (
                            <div 
                              key={child.id}
                              onClick={() => togglePermission(child)}
                              className={`flex items-center justify-between p-3.5 rounded-[1rem] border cursor-pointer transition-all ${activePerms.includes(child.id) ? 'bg-white border-[#7171a7] text-[#1e1b4b]' : 'bg-white border-slate-50 text-slate-300 hover:border-slate-200'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${activePerms.includes(child.id) ? 'bg-[#7171a7]' : 'bg-slate-100'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest truncate">
                                  {child.name.replace(parent.name + '/', '')}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-100 p-8 text-center">
                <Shield size={32} strokeWidth={1.5} className="text-slate-100 mb-6" />
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-200">Выберите роль для настройки</h2>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}