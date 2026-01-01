"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  Shield, Plus, Loader2, CheckCircle2, ChevronLeft,
  Layout, Link as LinkIcon, ChevronDown, Save
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

  // --- ЛОГИКА ВЫБОРА (ИСПРАВЛЕНА) ---
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
      // parts = ['partner', 'office', 'staff']
      let currentPath = "";
      parts.forEach((part: string) => {
        currentPath += `/${part}`;
        // Ищем разрешение, соответствующее этому куску пути
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
        // Обновляем локальные данные ролей, чтобы при переключении не сбрасывалось
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
            isActive ? 'bg-[#1e1b4b] text-white border-[#1e1b4b]' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
          }`}
          style={{ marginLeft: level * 24 }}
          onClick={() => togglePermission(node)}
        >
          {isActive ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
          
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider">{node.description || node.name}</div>
            <div className={`text-[10px] ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>{node.name}</div>
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

  // Корневые элементы (те, у которых нет родителя в списке)
  const rootNodes = useMemo(() => {
    return permissions.filter(p => {
      const parts = p.name.split('/').filter(Boolean);
      // Если уровень 1 (/admin) - точно корень
      if (parts.length === 1) return true; 
      
      // Иначе ищем родителя
      const parentPath = '/' + parts.slice(0, -1).join('/');
      return !permissions.some(x => x.name === parentPath);
    });
  }, [permissions]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 text-[#1e1b4b] font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА: РОЛИ */}
        <div className="col-span-4 space-y-6">
          <Link href="/admin/settings" className="flex items-center gap-2 text-slate-400 hover:text-[#1e1b4b] mb-4">
            <ChevronLeft size={16} /> Назад
          </Link>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4">Роли</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    // ВОТ ЗДЕСЬ БЫЛА ОШИБКА. ТЕПЕРЬ ИСПРАВЛЕНО:
                    // Берем permissions напрямую у роли (Role -> RolePermission)
                    const ids = role.permissions.map((rp: any) => rp.permissionId);
                    setActivePerms(ids);
                  }}
                  className={`w-full text-left p-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedRole?.id === role.id 
                    ? 'bg-[#1e1b4b] text-white shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <form onSubmit={handleCreateRole} className="flex gap-2">
                <input 
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="NEW ROLE..." 
                  className="flex-1 bg-slate-50 px-3 py-2 rounded-lg text-xs font-bold uppercase outline-none focus:ring-2 ring-indigo-500/20"
                />
                <button disabled={loading} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                  <Plus size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ПРАВА */}
        <div className="col-span-8">
          {selectedRole ? (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">Настройка прав</h1>
                  <p className="text-xs font-bold text-indigo-500 mt-1">{selectedRole.name}</p>
                </div>
                <button 
                  onClick={savePermissions}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#1e1b4b] text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-xl shadow-indigo-900/10"
                >
                  <Save size={16} />
                  <span className="text-xs font-black uppercase tracking-wider">Сохранить</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {rootNodes.map(root => (
                  <PermissionNode key={root.id} node={root} level={0} />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-[2rem] border border-slate-100 text-slate-300">
              <div className="text-center">
                <Shield size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Выберите роль</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}