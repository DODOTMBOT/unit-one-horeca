"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ArrowLeft, Loader2, Star, UserCircle, 
  Search, Hash, ChevronDown, Check, X, Users, UserMinus
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
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans text-[#1e1b4b]">
      <div className="max-w-[1000px] mx-auto px-6 pt-12">
        
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/partner" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tighter">Штатное расписание</h1>
            <span className="px-2 py-0.5 bg-indigo-50 rounded text-[9px] font-bold text-indigo-600 uppercase tracking-widest">
              {staff.length} чел.
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              placeholder="Поиск по имени или email..." 
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-500 w-full sm:w-[280px] transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="flex items-center gap-2 mb-6 bg-slate-100/50 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "active" 
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users size={14} />
            Штатка ({counts.active})
          </button>
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "unassigned" 
              ? "bg-white text-rose-600 shadow-sm ring-1 ring-slate-200" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <UserMinus size={14} />
            Вне штата ({counts.unassigned})
          </button>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm">
          <div className="hidden lg:flex items-center gap-4 px-8 py-4 bg-slate-50/50 border-b border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400 rounded-t-[28px]">
            <div className="w-8 flex justify-center"><Hash size={10} /></div>
            <div className="flex-[2]">Сотрудник</div>
            <div className="flex-[2]">Объекты доступа</div>
            <div className="flex-1">Роль</div>
            <div className="w-[180px] text-right">Управление</div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest leading-none">Обновление данных...</p>
            </div>
          ) : processedStaff.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center px-6 animate-in fade-in duration-500">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeTab === 'active' ? 'bg-indigo-50 text-indigo-200' : 'bg-rose-50 text-rose-200'}`}>
                {activeTab === "active" ? <Users size={32} /> : <UserMinus size={32} />}
              </div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                {activeTab === "active" ? "Все сотрудники сейчас вне штата" : "Все сотрудники распределены по объектам"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 relative">
              {processedStaff.map((employee, idx) => {
                const currentEstIds = employee.establishments?.map((e: any) => e.id) || [];
                
                return (
                  <div key={employee.id} className="flex flex-col lg:flex-row lg:items-center gap-4 px-8 py-5 hover:bg-slate-50/30 transition-colors animate-in fade-in duration-300">
                    <div className="hidden lg:flex w-8 justify-center text-[10px] font-bold text-slate-200">{idx + 1}</div>
                    
                    <div className="flex-[2] flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${employee.role === 'MANAGER' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300'}`}>
                        {employee.role === 'MANAGER' ? <Star size={18} fill="currentColor" /> : <UserCircle size={22} />}
                      </div>
                      <div className="flex flex-col">
                        <Link href={`/profile/${employee.id}`} className="text-[12px] font-black uppercase tracking-tight text-[#1e1b4b] hover:text-indigo-600 transition-colors">
                          {employee.name} {employee.surname}
                        </Link>
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">{employee.email}</span>
                      </div>
                    </div>

                    <div className="flex-[2] relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === employee.id ? null : employee.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl transition-all ${
                          currentEstIds.length > 0 
                          ? "bg-white border-slate-100 shadow-sm" 
                          : "bg-rose-50/30 border-rose-100 ring-4 ring-rose-500/5"
                        } hover:border-indigo-200`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-tight truncate max-w-[150px] ${currentEstIds.length > 0 ? "text-[#1e1b4b]" : "text-rose-400"}`}>
                          {employee.establishments && employee.establishments.length > 0 
                            ? employee.establishments.map((e:any) => e.name).join(", ") 
                            : "Выбрать объект..."}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openDropdownId === employee.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdownId === employee.id && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                          <div className="max-h-[200px] overflow-y-auto space-y-1 custom-scrollbar">
                            {establishments.length === 0 ? (
                                <p className="p-3 text-[9px] font-black uppercase text-slate-300 text-center">У вас пока нет созданных объектов</p>
                            ) : establishments.map((est) => (
                              <button
                                key={est.id}
                                onClick={() => {
                                  const newIds = currentEstIds.includes(est.id)
                                    ? currentEstIds.filter((id: string) => id !== est.id)
                                    : [...currentEstIds, est.id];
                                  updateEstablishments(employee.id, newIds);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors group"
                              >
                                <span className={`text-[10px] font-bold uppercase text-left ${currentEstIds.includes(est.id) ? "text-indigo-600" : "text-slate-500"}`}>
                                  {est.name} <span className="text-[9px] font-normal opacity-60">({est.address})</span>
                                </span>
                                {currentEstIds.includes(est.id) && <Check size={12} className="text-indigo-600 shrink-0 ml-2" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${employee.role === 'MANAGER' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {employee.role}
                      </div>
                    </div>

                    <div className="w-full lg:w-[180px] flex justify-end">
                      <button
                        disabled={updatingId === employee.id}
                        onClick={() => toggleRole(employee.id, employee.role)}
                        className={`w-full lg:w-auto px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${employee.role === 'MANAGER' ? 'bg-white border-rose-100 text-rose-500 hover:bg-rose-50' : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50'}`}
                      >
                        {updatingId === employee.id ? <Loader2 size={12} className="animate-spin" /> : (employee.role === 'MANAGER' ? 'Понизить' : 'Сделать управляющим')}
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
  );
}