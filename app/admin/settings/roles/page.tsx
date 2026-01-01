"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  Shield, Plus, Loader2, CheckCircle2, ChevronLeft,
  ChevronDown, Save, UserCog
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
      setFetching(true);
      const [rRes, pRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/roles/permissions")
      ]);
      
      if (rRes.ok && pRes.ok) {
        const rData = await rRes.json();
        const pData = await pRes.json();
        setRoles(rData);
        setPermissions(pData);
      }
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- ЛОГИКА ВЫБОРА ---
  const togglePermission = (perm: any) => {
    let newSelection = [...activePerms];
    const isActivating = !newSelection.includes(perm.id);

    if (isActivating) {
      // 1. Добавляем сам элемент
      newSelection.push(perm.id);

      // 2. Добавляем всех ДЕТЕЙ (вниз по иерархии)
      const children = permissions.filter(p => p.name.startsWith(perm.name + '/'));
      children.forEach(child => {
        if (!newSelection.includes(child.id)) newSelection.push(child.id);
      });

      // 3. Добавляем РОДИТЕЛЕЙ (вверх по иерархии)
      const parts = perm.name.split('/').filter(Boolean);
      let currentPath = "";
      parts.forEach((part: string) => {
        currentPath += `/${part}`;
        const parent = permissions.find(p => p.name === currentPath);
        if (parent && !newSelection.includes(parent.id)) {
          newSelection.push(parent.id);
        }
      });

    } else {
      // 1. Удаляем сам элемент
      newSelection = newSelection.filter(id => id !== perm.id);

      // 2. Удаляем всех ДЕТЕЙ (без родителя они не работают)
      const childrenIds = permissions
        .filter(p => p.name.startsWith(perm.name + '/'))
        .map(p => p.id);
      
      newSelection = newSelection.filter(id => !childrenIds.includes(id));
    }
    
    setActivePerms(newSelection);
  };

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
        loadData();
      }
    } finally {
      setLoading(false);
    }
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
      
      if (res.ok) {
        alert("Права сохранены! Перезайдите в аккаунт.");
        loadData();
      } else {
        alert("Ошибка сохранения");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  // Компонент отрисовки строки
  const PermissionNode = ({ node, level = 0 }: { node: any, level: number }) => {
    const [isOpen, setIsOpen] = useState(true);

    const children = useMemo(() => {
      const nodeSlashes = node.name.split('/').length;
      return permissions.filter(p => {
        return p.name.startsWith(node.name + '/') && 
               p.name.split('/').length === nodeSlashes + 1;
      });
    }, [node, permissions]);

    const isActive = activePerms.includes(node.id);

    return (
      <div className="flex flex-col w-full">
        <div 
          className={`flex items-center gap-3 p-3 rounded-xl border mb-2 cursor-pointer transition-all ${
            isActive ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-white border-gray-100 text-gray-500 hover:border-[#10b981]'
          }`}
          style={{ marginLeft: level * 24 }}
          onClick={() => togglePermission(node)}
        >
          {isActive ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-300" />}
          
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider">{node.description || node.name}</div>
            <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-300'}`}>{node.name}</div>
          </div>

          {children.length > 0 && (
            <div 
              onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <ChevronDown size={14} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </div>
          )}
        </div>

        {isOpen && children.map(child => (
          <PermissionNode key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    );
  };

  const rootNodes = useMemo(() => {
    return permissions.filter(p => {
      const parts = p.name.split('/').filter(Boolean);
      if (parts.length === 1) return true; 
      const parentPath = '/' + parts.slice(0, -1).join('/');
      return !permissions.some(x => x.name === parentPath);
    });
  }, [permissions]);

  return (
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 px-2">
        <Link href="/admin/settings" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-light text-[#111827] tracking-tight">Роли и Доступы</h1>
          <p className="text-sm text-gray-500 font-medium">Управление правами пользователей</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА: СПИСОК РОЛЕЙ */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-soft sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
                <UserCog size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#111827]">Роли</h2>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    const ids = role.permissions.map((rp: any) => rp.permissionId);
                    setActivePerms(ids);
                  }}
                  className={`w-full text-left p-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    selectedRole?.id === role.id 
                    ? 'bg-[#10b981] text-white border-[#10b981] shadow-lg shadow-emerald-500/20' 
                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <form onSubmit={handleCreateRole} className="flex gap-2">
                <input 
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="NEW ROLE..." 
                  className="flex-1 bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none transition-all"
                />
                <button disabled={loading} className="bg-[#10b981] text-white p-2.5 rounded-xl hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-500/20">
                  <Plus size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: МАТРИЦА ПРАВ */}
        <div className="lg:col-span-8">
          {selectedRole ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-soft min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">Настройка прав</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{selectedRole.name}</p>
                  </div>
                </div>
                
                <button 
                  onClick={savePermissions}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#10b981] text-white px-6 py-3 rounded-xl hover:bg-[#059669] hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span className="text-xs font-bold uppercase tracking-wider">Сохранить</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {rootNodes.map(root => (
                  <PermissionNode key={root.id} node={root} level={0} />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] shadow-soft text-gray-300 border border-dashed border-gray-200">
              <Shield size={64} className="mb-4 opacity-20" strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Выберите роль для настройки</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}