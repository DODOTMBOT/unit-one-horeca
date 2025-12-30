"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Loader2, Search, Mail, UserCircle, 
  Calendar, Home, LogOut, Phone, Globe, ShieldCheck, ChevronLeft,
  Edit3, ArrowUpDown, User
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12 pb-20">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1">
            {/* ИЗМЕНЕНО: Ссылка теперь ведет на настройки */}
            <Link href="/admin/settings" className="group flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-white border border-slate-200 transition-colors hover:bg-slate-50">
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-200 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#1e1b4b] leading-none text-center">
              Пользователи платформы
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-6">
             <Link href="/admin/settings/roles" className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#7171a7] transition-colors flex items-center gap-2">
                <ShieldCheck size={14}/> Роли
             </Link>
            <Link href="/" className="w-12 h-12 bg-white border border-slate-200 rounded-[1.5rem] flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </Link>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
            <div className="relative w-full lg:w-[450px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    placeholder="ПОИСК ПО БАЗЕ..." 
                    className="pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#7171a7] text-[#1e1b4b] placeholder:text-slate-500 w-full transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-10 px-10 py-4 bg-white border border-slate-200 rounded-[1.5rem]">
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Yandex</span>
                    <span className="text-xs font-black text-[#1e1b4b]">{stats?.yandexUsers || 0}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-200" />
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Web</span>
                    <span className="text-xs font-black text-[#1e1b4b]">{stats?.webUsers || 0}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-200" />
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-[#7171a7] uppercase tracking-widest mb-1">Admins</span>
                    <span className="text-xs font-black text-[#7171a7]">{stats?.totalAdmins || 0}</span>
                </div>
            </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th onClick={() => requestSort('name')} className="p-6 cursor-pointer hover:bg-slate-50 transition-colors pl-10">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Пользователь <ArrowUpDown size={10} className={sortConfig.key === 'name' ? 'text-[#7171a7]' : 'text-slate-400'} />
                    </div>
                  </th>
                  <th onClick={() => requestSort('email')} className="p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Контакты <ArrowUpDown size={10} className={sortConfig.key === 'email' ? 'text-[#7171a7]' : 'text-slate-400'} />
                    </div>
                  </th>
                  <th onClick={() => requestSort('role')} className="p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Роль <ArrowUpDown size={10} className={sortConfig.key === 'role' ? 'text-[#7171a7]' : 'text-slate-400'} />
                    </div>
                  </th>
                  <th onClick={() => requestSort('date')} className="p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Регистрация <ArrowUpDown size={10} className={sortConfig.key === 'date' ? 'text-[#7171a7]' : 'text-slate-400'} />
                    </div>
                  </th>
                  <th className="p-6 text-right text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] pr-10">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin inline text-slate-500" size={32} /></td></tr>
                ) : processedUsers.map((user) => {
                    const isYandex = user.accounts?.some((acc: any) => acc.provider === 'yandex');
                    const currentRoleName = user.newRole?.name || user.role;

                    return (
                      <tr key={user.id} className="group transition-all hover:bg-slate-50/60">
                        <td className="p-5 pl-10">
                          <Link href={`/profile/${user.id}`} className="flex items-center gap-4 group/user">
                            <div className="relative h-11 w-11 flex-shrink-0 transition-transform group-hover/user:scale-105">
                                <div className="h-full w-full rounded-2xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 group-hover/user:border-[#7171a7]/50 transition-colors">
                                    {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : <UserCircle size={24} />}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-white ${isYandex ? 'text-rose-600' : 'text-indigo-600'}`}>
                                    {isYandex ? <span className="text-[7px] font-black">Y</span> : <Globe size={8} />}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black uppercase tracking-tight text-[#1e1b4b] group-hover/user:text-[#7171a7] transition-colors">
                                    {user.name || 'Без'} {user.surname || ''}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isYandex ? 'text-rose-600' : 'text-slate-500'}`}>
                                    ID: {user.id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                          </Link>
                        </td>

                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold lowercase text-[#1e1b4b] leading-none mb-1">{user.email}</span>
                            {user.phone && <span className="text-[9px] font-black tracking-widest text-slate-600">{user.phone}</span>}
                          </div>
                        </td>

                        <td className="p-5">
                          <select 
                            value={user.roleId || ""}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`w-full max-w-[140px] appearance-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none border border-slate-300 cursor-pointer transition-all ${currentRoleName === 'ADMIN' || currentRoleName === 'OWNER' ? 'bg-[#1e1b4b] text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'}`}
                          >
                            <option value="" disabled>НЕТ РОЛИ</option>
                            {roles.map((r: any) => (
                              <option key={r.id} value={r.id} className="bg-white text-black">{r.name}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-5">
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">
                              {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </td>

                        <td className="p-5 text-right pr-10">
                          <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-all">
                            <Link href={`/profile/${user.id}`} title="Профиль">
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-[#7171a7] hover:border-[#7171a7] transition-all">
                                    <User size={16} />
                                </button>
                            </Link>
                            <Link href={`/admin/users/edit/${user.id}`} title="Настройки">
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-[#7171a7] hover:border-[#7171a7] transition-all">
                                    <Edit3 size={16} />
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

        {/* FOOTER */}
        <div className="mt-12 flex justify-between items-center opacity-60">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#1e1b4b]">Terminal v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700">Active Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}