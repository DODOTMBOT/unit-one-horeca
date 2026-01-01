"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Loader2, Search, UserCircle, 
  LogOut, Globe, ShieldCheck, ChevronLeft,
  Edit3, ArrowUpDown, User, CheckCircle2
} from "lucide-react";
import Link from "next/link";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function AdminUsersListPage() {
  const [users, setUsers] = useState<any[]>([]); 
  const [roles, setRoles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles")
      ]);

      if (usersRes.ok && rolesRes.ok) {
        const usersData = await usersRes.json();
        const rolesData = await rolesRes.json();
        setUsers(Array.isArray(usersData.users) ? usersData.users : []);
        setStats(usersData.stats);
        setRoles(rolesData);
      }
    } catch (err) {
      console.error("Ошибка загрузки", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId: newRoleId }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, roleId: newRoleId, newRole: roles.find(r => r.id === newRoleId) } : u
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedUsers = useMemo(() => {
    let filtered = users.filter(u => 
      `${u.name || ''} ${u.surname || ''}`.toLowerCase().includes(search.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name': 
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = (a.newRole?.name || a.role || '').toLowerCase();
          bValue = (b.newRole?.name || b.role || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, search, sortConfig, roles]);

  return (
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-[#111827] tracking-tight">Пользователи</h1>
            <p className="text-sm text-gray-500 font-medium">База данных клиентов и сотрудников</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <Link 
             href="/admin/settings/roles" 
             className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#10b981] hover:border-[#10b981] transition-all"
           >
              <ShieldCheck size={16}/> Роли
           </Link>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:w-[450px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                  placeholder="ПОИСК ПО ИМЕНИ ИЛИ EMAIL..." 
                  className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all placeholder:text-gray-300 shadow-soft"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>

          <div className="flex items-center gap-8 px-8 py-3 bg-white border border-gray-100 rounded-xl shadow-soft">
              <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Yandex</span>
                  <span className="text-sm font-bold text-[#111827]">{stats?.yandexUsers || 0}</span>
              </div>
              <div className="w-px h-6 bg-gray-100" />
              <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Web</span>
                  <span className="text-sm font-bold text-[#111827]">{stats?.webUsers || 0}</span>
              </div>
              <div className="w-px h-6 bg-gray-100" />
              <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-widest mb-0.5">Admins</span>
                  <span className="text-sm font-bold text-[#10b981]">{stats?.totalAdmins || 0}</span>
              </div>
          </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-soft overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th onClick={() => requestSort('name')} className="p-6 pl-8 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Пользователь <ArrowUpDown size={12} className={sortConfig.key === 'name' ? 'text-[#10b981]' : 'text-gray-300'} />
                  </div>
                </th>
                <th onClick={() => requestSort('email')} className="p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Контакты <ArrowUpDown size={12} className={sortConfig.key === 'email' ? 'text-[#10b981]' : 'text-gray-300'} />
                  </div>
                </th>
                <th onClick={() => requestSort('role')} className="p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Роль <ArrowUpDown size={12} className={sortConfig.key === 'role' ? 'text-[#10b981]' : 'text-gray-300'} />
                  </div>
                </th>
                <th onClick={() => requestSort('date')} className="p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Регистрация <ArrowUpDown size={12} className={sortConfig.key === 'date' ? 'text-[#10b981]' : 'text-gray-300'} />
                  </div>
                </th>
                <th className="p-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-8">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin inline text-[#10b981]" size={32} /></td></tr>
              ) : processedUsers.map((user) => {
                  const isYandex = user.accounts?.some((acc: any) => acc.provider === 'yandex');
                  const currentRoleName = user.newRole?.name || user.role;
                  const isAdmin = currentRoleName === 'ADMIN' || currentRoleName === 'OWNER';

                  return (
                    <tr key={user.id} className="group transition-all hover:bg-gray-50">
                      <td className="p-5 pl-8">
                        <Link href={`/profile/${user.id}`} className="flex items-center gap-4 group/user">
                          <div className="relative h-10 w-10 flex-shrink-0">
                              <div className="h-full w-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 border border-gray-200 group-hover/user:border-[#10b981] transition-colors">
                                  {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : <UserCircle size={20} />}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-white ${isYandex ? 'text-red-500' : 'text-blue-500'}`}>
                                  {isYandex ? <span className="text-[8px] font-black">Y</span> : <Globe size={10} />}
                              </div>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-[#111827] group-hover/user:text-[#10b981] transition-colors">
                                  {user.name || 'Без имени'} {user.surname || ''}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                  ID: {user.id.slice(0, 8)}...
                              </span>
                          </div>
                        </Link>
                      </td>

                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[#111827] mb-0.5">{user.email}</span>
                          {user.phone ? (
                             <span className="text-[10px] font-mono text-gray-500">{user.phone}</span>
                          ) : (
                             <span className="text-[10px] text-gray-300">-</span>
                          )}
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="relative">
                          <select 
                            value={user.roleId || ""}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`
                              appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none border cursor-pointer transition-all
                              ${isAdmin 
                                ? 'bg-[#10b981] text-white border-[#10b981]' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#10b981]'
                              }
                            `}
                          >
                            <option value="" disabled>НЕТ РОЛИ</option>
                            {roles.map((r: any) => (
                              <option key={r.id} value={r.id} className="bg-white text-black">{r.name}</option>
                            ))}
                          </select>
                          {/* Кастомная стрелочка */}
                          <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isAdmin ? 'text-white' : 'text-gray-400'}`}>
                            <ChevronLeft size={10} className="-rotate-90" />
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <span className="text-xs font-medium text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </td>

                      <td className="p-5 text-right pr-8">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Link href={`/profile/${user.id}`} title="Профиль">
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-[#10b981] hover:border-[#10b981] hover:bg-[#ecfdf5] transition-all">
                                  <User size={14} />
                              </button>
                          </Link>
                          <Link href={`/admin/users/edit/${user.id}`} title="Редактировать">
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-[#10b981] hover:border-[#10b981] hover:bg-[#ecfdf5] transition-all">
                                  <Edit3 size={14} />
                              </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}