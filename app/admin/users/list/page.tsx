"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, User, Search, X, Mail, Phone, MapPin, Utensils, ExternalLink } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/get-users');
      if (!res.ok) throw new Error('Ошибка при получении данных');
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter((u: any) => {
      const fields = [u.name, u.email, u.phone, u.socialLink, u.restaurantName, u.restaurantAddress];
      return fields.some(field => (field || "").toLowerCase().includes(query));
    });
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) fetchUsers();
    } catch (error) { console.error("Update role error:", error); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F3F6]">
      <div className="text-[10px] tracking-[0.3em] font-black uppercase text-indigo-400 animate-pulse">Синхронизация...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-10">
      <div className="mx-auto max-w-[1400px] px-4 pt-6">
        
        {/* ХЕДЕР (Компактный) */}
        <header className="sticky top-4 z-40 mb-6 flex h-16 items-center justify-between rounded-3xl border border-slate-200 bg-white/90 px-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/admin" className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-100 hover:scale-110 transition-all">
              <ChevronLeft size={16} className="text-slate-600" />
            </Link>
            <h1 className="text-sm font-black uppercase tracking-tighter text-[#1e1b4b]">Пользователи</h1>
          </div>

          <div className="relative flex-1 max-w-md mx-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <ShieldCheck size={12} className="text-indigo-500" />
            <span className="text-[9px] font-black uppercase text-indigo-600 leading-none">{users.length} чел.</span>
          </div>
        </header>

        {/* СПИСОК (Табличный вид) */}
        <div className="space-y-2">
          {filteredUsers.map((user: any) => (
            <div 
              key={user.id} 
              className={`group grid grid-cols-1 lg:grid-cols-[1fr_180px_220px_120px_160px] items-center gap-4 p-2 px-4 rounded-2xl border transition-all backdrop-blur-sm
                ${user.role === 'ADMIN' 
                  ? "border-indigo-100 bg-indigo-50/20 shadow-sm" 
                  : "border-white bg-white/70 hover:bg-white hover:shadow-md"}`}
            >
              {/* 1. ОСНОВНАЯ ИНФО */}
              <Link 
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-3 overflow-hidden group/link"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all
                  ${user.role === 'ADMIN' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-[#1e1b4b] group-hover:text-white"}`}>
                  {user.role === 'ADMIN' ? <ShieldCheck size={18} /> : <User size={18} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[12px] font-bold text-[#1e1b4b] uppercase tracking-tight truncate group-hover/link:text-indigo-600 transition-colors">
                    {user.name || "Без имени"}
                  </h4>
                  <span className="text-[9px] font-medium text-slate-400 truncate tracking-tight">{user.email}</span>
                </div>
              </Link>

              {/* 2. КОНТАКТЫ */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Phone size={10} className="text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-bold text-[#1e1b4b] truncate">{user.phone || "—"}</span>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase truncate">{user.socialLink || "no social"}</span>
              </div>

              {/* 3. ЗАВЕДЕНИЕ */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Utensils size={10} className="text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-bold text-[#1e1b4b] truncate uppercase tracking-tighter">{user.restaurantName || "—"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="text-slate-300 shrink-0" />
                  <span className="text-[9px] font-medium text-slate-400 truncate italic">{user.restaurantAddress || "—"}</span>
                </div>
              </div>

              {/* 4. РОЛЬ */}
              <div className="flex justify-start lg:justify-center">
                <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest
                  ${user.role === 'ADMIN' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {user.role}
                </span>
              </div>

              {/* 5. КНОПКА ДЕЙСТВИЯ */}
              <div className="flex justify-end">
                <button
                  onClick={() => toggleRole(user.id, user.role)}
                  className={`w-full lg:w-auto px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all
                    ${user.role === 'ADMIN' 
                      ? 'bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50' 
                      : 'bg-[#1e1b4b] text-white hover:bg-indigo-600'
                    }`}
                >
                  {user.role === 'ADMIN' ? "Снять права" : "Дать админа"}
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="py-10 text-center rounded-[32px] border-2 border-dashed border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Ничего не найдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}