"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ArrowLeft, Loader2, Star, UserCircle, 
  Search, Hash, ChevronDown, Check, Users, UserMinus, Home
} from "lucide-react";
import Link from "next/link";

type TabType = "active" | "unassigned";

export default function PartnerStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("active");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffRes, estRes] = await Promise.all([
        fetch(`/api/partner/all-staff?t=${Date.now()}`, { 
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache' } 
        }),
        fetch(`/api/establishments?t=${Date.now()}`, { cache: 'no-store' })
      ]);
      
      const staffData = await staffRes.json();
      const estData = await estRes.json();
      
      setStaff(Array.isArray(staffData) ? staffData : []);
      setEstablishments(Array.isArray(estData) ? estData : []);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const counts = useMemo(() => {
    return {
      active: staff.filter(s => s.establishments && s.establishments.length > 0).length,
      unassigned: staff.filter(s => !s.establishments || s.establishments.length === 0).length
    };
  }, [staff]);

  const processedStaff = useMemo(() => {
    const filteredBySearch = staff.filter(s => 
      `${s.name || ''} ${s.surname || ''}`.toLowerCase().includes(search.toLowerCase()) || 
      (s.email || '').toLowerCase().includes(search.toLowerCase())
    );

    if (activeTab === "active") {
      return filteredBySearch.filter(s => s.establishments && s.establishments.length > 0);
    } else {
      return filteredBySearch.filter(s => !s.establishments || s.establishments.length === 0);
    }
  }, [staff, search, activeTab]);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "MANAGER" ? "USER" : "MANAGER";
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/partner/all-staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });
      
      if (res.ok) {
        setStaff(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const updateEstablishments = async (userId: string, selectedEstIds: string[]) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/partner/all-staff/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, establishmentIds: selectedEstIds }),
      });
      
      if (res.ok) {
        setStaff(prev => prev.map(u => u.id === userId ? { 
          ...u, 
          establishments: establishments.filter(e => selectedEstIds.includes(e.id)) 
        } : u));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP INTERFACE BAR */}
        <header className="flex items-center justify-between mb-20">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/partner/office" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-all hover:bg-slate-50 flex items-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Менеджер офиса</p>
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:block shadow-sm">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Сотрудники
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 shadow-sm flex items-center gap-3"
            >
              <Home size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Главная</p>
            </Link>
          </div>
        </header>

        {/* CONTROLS AREA */}
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[1.5rem] w-fit border border-slate-200/50">
              <button
                onClick={() => setActiveTab("active")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "active" 
                  ? "bg-white text-indigo-600 shadow-md ring-1 ring-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Users size={14} />
                Сотрудники ({counts.active})
              </button>
              <button
                onClick={() => setActiveTab("unassigned")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "unassigned" 
                  ? "bg-white text-rose-600 shadow-md ring-1 ring-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <UserMinus size={14} />
                Без привязки ({counts.unassigned})
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                placeholder="ПОИСК ПО ИМЕНИ ИЛИ EMAIL..." 
                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500/10 w-full sm:w-[320px] transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ИСПРАВЛЕНО: Удален overflow-hidden, чтобы список не обрезался */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative">
            <div className="hidden lg:flex items-center gap-4 px-10 py-5 bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-t-[2.5rem]">
              <div className="w-8 flex justify-center"><Hash size={12} /></div>
              <div className="flex-[2]">Сотрудник</div>
              <div className="flex-[2]">Объекты доступа</div>
              <div className="flex-1">Роль</div>
              <div className="w-[180px] text-right">Управление</div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Синхронизация...</p>
              </div>
            ) : processedStaff.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-6">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 ${activeTab === 'active' ? 'bg-indigo-50 text-indigo-200' : 'bg-rose-50 text-rose-200'}`}>
                  {activeTab === "active" ? <Users size={40} /> : <UserMinus size={40} />}
                </div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  {activeTab === "active" ? "Список пуст" : "Нет нераспределенных сотрудников"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 relative">
                {processedStaff.map((employee, idx) => {
                  const currentEstIds = employee.establishments?.map((e: any) => e.id) || [];
                  const isDropdownOpen = openDropdownId === employee.id;
                  
                  return (
                    <div 
                      key={employee.id} 
                      /* ИСПРАВЛЕНО: Добавлен относительный позиционинг и динамический z-index */
                      className={`flex flex-col lg:flex-row lg:items-center gap-4 px-10 py-7 hover:bg-slate-50/30 transition-colors relative ${isDropdownOpen ? 'z-50' : 'z-10'}`}
                    >
                      <div className="hidden lg:flex w-8 justify-center text-[11px] font-black text-slate-200">{idx + 1}</div>
                      
                      <div className="flex-[2] flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${employee.role === 'MANAGER' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300'}`}>
                          {employee.role === 'MANAGER' ? <Star size={20} fill="currentColor" /> : <UserCircle size={26} />}
                        </div>
                        <div className="flex flex-col">
                          <Link href={`/partner/profile/${employee.id}`} className="text-sm font-black uppercase tracking-tight text-[#1e1b4b] hover:text-indigo-600 transition-colors leading-none mb-1.5">
                            {employee.name} {employee.surname}
                          </Link>
                          <span className="text-[10px] font-bold text-slate-400">{employee.email}</span>
                        </div>
                      </div>

                      <div className="flex-[2] relative">
                        <button 
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : employee.id)}
                          className={`w-full flex items-center justify-between px-5 py-3 border rounded-2xl transition-all ${
                            currentEstIds.length > 0 
                            ? "bg-white border-slate-100 shadow-sm" 
                            : "bg-rose-50/30 border-rose-100"
                          } hover:border-indigo-200`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-tight truncate max-w-[180px] ${currentEstIds.length > 0 ? "text-[#1e1b4b]" : "text-rose-400"}`}>
                            {employee.establishments && employee.establishments.length > 0 
                              ? employee.establishments.map((e:any) => e.name).join(", ") 
                              : "Выбрать объект..."}
                          </span>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                          /* ИСПРАВЛЕНО: Увеличен z-index выпадающего списка */
                          <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] z-[100] p-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="max-h-[240px] overflow-y-auto space-y-1 custom-scrollbar">
                              {establishments.length === 0 ? (
                                  <p className="p-4 text-[10px] font-black uppercase text-slate-300 text-center">Объекты не созданы</p>
                              ) : establishments.map((est) => (
                                <button
                                  key={est.id}
                                  onClick={() => {
                                    const newIds = currentEstIds.includes(est.id)
                                      ? currentEstIds.filter((id: string) => id !== est.id)
                                      : [...currentEstIds, est.id];
                                    updateEstablishments(employee.id, newIds);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                >
                                  <span className={`text-[10px] font-bold uppercase text-left ${currentEstIds.includes(est.id) ? "text-indigo-600" : "text-slate-500"}`}>
                                    {est.name} <span className="text-[9px] font-normal opacity-50 block">{est.address}</span>
                                  </span>
                                  {currentEstIds.includes(est.id) && <Check size={14} className="text-indigo-600 shrink-0 ml-2" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${employee.role === 'MANAGER' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                          {employee.role}
                        </div>
                      </div>

                      <div className="w-full lg:w-[180px] flex justify-end">
                        <button
                          disabled={updatingId === employee.id}
                          onClick={() => toggleRole(employee.id, employee.role)}
                          className={`w-full lg:w-auto px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${employee.role === 'MANAGER' ? 'bg-white border-rose-100 text-rose-500 hover:bg-rose-50' : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          {updatingId === employee.id ? <Loader2 size={14} className="animate-spin mx-auto" /> : (employee.role === 'MANAGER' ? 'Понизить' : 'Управляющий')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}