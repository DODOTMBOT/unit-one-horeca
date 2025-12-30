"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Loader2, Search, Mail, UserCircle, 
  Calendar, Home, LogOut, Phone, Globe
} from "lucide-react";
import Link from "next/link";

export default function AdminUsersListPage() {
  const [users, setUsers] = useState<any[]>([]); 
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        // Забираем массив из ключа data.users, как настроено в API
        setUsers(Array.isArray(data.users) ? data.users : []);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Ошибка загрузки пользователей", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Фильтрация по поиску (имя, фамилия, email)
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      `${u.name || ''} ${u.surname || ''}`.toLowerCase().includes(search.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12 pb-20">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER BAR */}
        <header className="flex items-center justify-between mb-20">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 flex items-center gap-3 group"
            >
              <Home size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Панель</p>
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:block shadow-sm">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Пользователи {stats?.totalUsers ? `(${stats.totalUsers})` : ''}
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-2">
            <Link 
              href="/" 
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
              title="Выйти"
            >
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        {/* CONTROLS & DETAILED STATS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    placeholder="ПОИСК ПО ИМЕНИ ИЛИ EMAIL..." 
                    className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500/10 w-full sm:w-[420px] transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-8 px-10 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Яндекс</span>
                    <span className="text-xs font-black text-slate-800 leading-none">{stats?.yandexUsers || 0}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-100" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Сайт</span>
                    <span className="text-xs font-black text-slate-800 leading-none">{stats?.webUsers || 0}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-100" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Админы</span>
                    <span className="text-xs font-black text-indigo-600 leading-none">{stats?.totalAdmins || 0}</span>
                </div>
            </div>
        </div>

        {/* USERS GRID */}
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4 text-slate-300">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Синхронизация...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2rem] border-dashed border-2 border-slate-100">
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Пользователи не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => {
              // Проверяем наличие Яндекс-провайдера в аккаунтах
              const isYandex = user.accounts?.some((acc: any) => acc.provider === 'yandex');

              return (
                <div key={user.id} className="group bg-white p-8 rounded-[2rem] border border-slate-100 transition-all duration-300 flex flex-col justify-between h-[280px] hover:border-indigo-200">
                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 transition-colors overflow-hidden border border-slate-50">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle size={24} />
                          )}
                        </div>
                        
                        {/* МАЛЕНЬКИЙ ИНДИКАТОР ИСТОЧНИКА НА ФОТО */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border flex items-center justify-center bg-white shadow-sm ${isYandex ? 'border-rose-100 text-rose-500' : 'border-indigo-100 text-indigo-500'}`}>
                           {isYandex ? <span className="text-[8px] font-black">Y</span> : <Globe size={10} />}
                        </div>
                      </div>

                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'ADMIN' || user.role === 'PARTNER' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                          {user.role}
                      </div>
                    </div>
                    
                    <h3 className="text-[16px] font-black uppercase tracking-tight text-[#1e1b4b] mb-1 leading-tight line-clamp-1">
                      {user.name} {user.surname}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-400 truncate mb-1">
                      <Mail size={12} className="shrink-0" />
                      <span className="text-[11px] font-medium">{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Phone size={12} className="shrink-0" />
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                            {user.phone}
                        </span>
                      </div>
                    )}

                    {/* ТЕКСТОВАЯ МЕТКА ИСТОЧНИКА */}
                    <div className="mt-3 flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md border ${isYandex ? 'border-rose-100 text-rose-400 bg-rose-50/30' : 'border-slate-100 text-slate-300 bg-slate-50/50'}`}>
                            {isYandex ? 'Yandex ID' : 'Web Регистрация'}
                        </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}