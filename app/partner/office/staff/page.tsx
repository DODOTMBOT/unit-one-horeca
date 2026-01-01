"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { 
  ArrowLeft, Loader2, Star, UserCircle, 
  Search, ChevronDown, Check, Users, Home, UserPlus, UserMinus
} from "lucide-react";
import Link from "next/link";

type TabType = "active" | "unassigned";

export default function PartnerStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
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
      
      const staffArr = Array.isArray(staffData) ? staffData : [];
      setStaff(staffArr);
      setEstablishments(Array.isArray(estData) ? estData : []);

      const initialExpanded: Record<string, boolean> = {};
      estData.forEach((e: any) => { initialExpanded[e.id] = true; });
      setExpandedGroups(initialExpanded);

    } catch (err) {
      console.error("ОШИБКА ЗАГРУЗКИ:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Фильтрация и группировка
  const processedData = useMemo(() => {
    const filtered = staff.filter(s => 
      `${s.name || ''} ${s.surname || ''} ${s.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === "unassigned") {
      return filtered.filter(s => !s.establishments || s.establishments.length === 0);
    }

    // Группировка для вкладки "Активные"
    const groups: Record<string, any[]> = {};
    const activeStaff = filtered.filter(s => s.establishments && s.establishments.length > 0);

    activeStaff.forEach(s => {
      s.establishments.forEach((est: any) => {
        if (!groups[est.id]) groups[est.id] = [];
        groups[est.id].push(s);
      });
    });

    return establishments
      .map(est => ({
        id: est.id,
        name: est.name,
        address: est.address,
        city: est.city,
        items: groups[est.id] || []
      }))
      .filter(g => g.items.length > 0 || (searchQuery === "" && activeTab === "active"));
  }, [staff, establishments, searchQuery, activeTab]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateAssignments = async (userId: string, selectedEstIds: string[]) => {
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
      setOpenDropdownId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="animate-spin text-[#10b981]" size={40} />
      <div className="text-xs tracking-[0.2em] font-bold uppercase text-gray-400">ЗАГРУЗКА ШТАТА...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto px-4 uppercase">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/partner/office" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none uppercase">ШТАТ СОТРУДНИКОВ</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider">УПРАВЛЕНИЕ ДОСТУПОМ К ОБЪЕКТАМ</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="ПОИСК..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#10b981] w-64 lg:w-80 transition-all shadow-sm focus:ring-4 ring-[#10b981]/5 uppercase"
            />
          </div>
          <Link href="/partner" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#10b981] transition-all shadow-sm">
            <Home size={22} />
          </Link>
        </div>
      </header>

      {/* TABS CONTROLS */}
      <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/50 ml-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "active" 
            ? "bg-white text-[#10b981] shadow-sm ring-1 ring-slate-200" 
            : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users size={14} />
          РАСПРЕДЕЛЕНЫ
        </button>
        <button
          onClick={() => setActiveTab("unassigned")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "unassigned" 
            ? "bg-white text-rose-500 shadow-sm ring-1 ring-slate-200" 
            : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <UserMinus size={14} />
          БЕЗ ПРИВЯЗКИ
        </button>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">СОТРУДНИК</th>
              <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">УПРАВЛЕНИЕ ДОСТУПОМ</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "active" ? (
              (processedData as any[]).map((group) => {
                const isExpanded = expandedGroups[group.id] !== false;
                return (
                  <Fragment key={group.id}>
                    <tr onClick={() => toggleGroup(group.id)} className="cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 border-b border-gray-100">
                      <td colSpan={2} className="px-8 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 shadow-sm">
                              <Users size={20} />
                            </div>
                            <div>
                              <span className="text-sm font-bold uppercase tracking-wide text-slate-700">{group.name?.toUpperCase()}</span>
                              <p className="text-[10px] text-slate-400 font-medium leading-none mt-1 uppercase tracking-tight">{group.address?.toUpperCase()}, {group.city?.toUpperCase()}</p>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-lg font-bold ml-1 bg-white border border-slate-200 text-slate-400">
                              {group.items.length}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && group.items.map((employee: any) => (
                      <EmployeeRow 
                        key={`${group.id}-${employee.id}`} 
                        employee={employee} 
                        establishments={establishments}
                        openDropdownId={openDropdownId}
                        setOpenDropdownId={setOpenDropdownId}
                        updateAssignments={updateAssignments}
                        updatingId={updatingId}
                        groupId={group.id}
                      />
                    ))}
                  </Fragment>
                );
              })
            ) : (
              (processedData as any[]).map((employee: any) => (
                <EmployeeRow 
                  key={employee.id} 
                  employee={employee} 
                  establishments={establishments}
                  openDropdownId={openDropdownId}
                  setOpenDropdownId={setOpenDropdownId}
                  updateAssignments={updateAssignments}
                  updatingId={updatingId}
                  groupId="unassigned"
                />
              ))
            )}
          </tbody>
        </table>
        {processedData.length === 0 && (
          <div className="py-24 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest bg-gray-50/10">
            НИЧЕГО НЕ НАЙДЕНО
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeRow({ employee, establishments, openDropdownId, setOpenDropdownId, updateAssignments, updatingId, groupId }: any) {
  const employeeEstIds = employee.establishments?.map((e: any) => e.id) || [];
  const dropdownKey = `${groupId}-${employee.id}`;
  const isDropdownOpen = openDropdownId === dropdownKey;

  return (
    <tr className="group hover:bg-emerald-50/20 transition-colors border-b border-gray-50 last:border-0">
      <td className="px-10 py-5">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 ${employee.role === 'MANAGER' ? 'border-amber-200 bg-amber-50 text-amber-500' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
            {employee.role === 'MANAGER' ? <Star size={18} fill="currentColor" /> : <UserCircle size={22} />}
          </div>
          <div className="flex flex-col">
            <Link href={`/profile/${employee.id}`} className="text-[15px] font-bold text-gray-800 group-hover:text-[#10b981] transition-colors leading-tight uppercase">
              {employee.name?.toUpperCase()} {employee.surname?.toUpperCase()}
            </Link>
            <span className="text-xs text-gray-400 mt-0.5 lowercase">{employee.email}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-center relative">
          <button 
            disabled={updatingId === employee.id}
            onClick={() => setOpenDropdownId(isDropdownOpen ? null : dropdownKey)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[11px] font-bold uppercase tracking-tight ${employeeEstIds.length > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'}`}
          >
            {updatingId === employee.id ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {employeeEstIds.length > 0 ? `ОБЪЕКТОВ: ${employeeEstIds.length}` : 'ДОБАВИТЬ ОБЪЕКТ'}
            <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl z-[100] p-2 animate-in fade-in zoom-in-95 duration-200 uppercase">
              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {establishments.map((est: any) => (
                  <button
                    key={est.id}
                    onClick={() => {
                      const newIds = employeeEstIds.includes(est.id)
                        ? employeeEstIds.filter((id: string) => id !== est.id)
                        : [...employeeEstIds, est.id];
                      updateAssignments(employee.id, newIds);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className={`text-[11px] font-bold uppercase leading-none ${employeeEstIds.includes(est.id) ? 'text-[#10b981]' : 'text-slate-600'}`}>{est.name?.toUpperCase()}</p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase">{est.city?.toUpperCase()}</p>
                    </div>
                    {employeeEstIds.includes(est.id) && <Check size={14} className="text-[#10b981]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}