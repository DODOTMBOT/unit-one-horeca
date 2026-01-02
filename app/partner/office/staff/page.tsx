"use client";

import { useState, useEffect, useMemo, useCallback, Fragment, useRef } from "react";
import { ArrowLeft, Loader2, Search, ChevronDown, Check, Users, Home, UserMinus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function PartnerStaffPage() {
  const { data: session } = useSession();
  const [staff, setStaff] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: ID теперь включает контекст группы
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"active" | "unassigned">("active");

  const isFullAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";

  const fetchData = useCallback(async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      const ownerId = isFullAdmin ? "" : (session.user.partnerId || session.user.id);
      const rolesUrl = isFullAdmin ? `/api/admin/roles` : `/api/partner/roles/by-owner?ownerId=${ownerId}`;

      const [staffRes, estRes, rolesRes] = await Promise.all([
        fetch(`/api/partner/all-staff?t=${Date.now()}`),
        fetch(`/api/establishments?t=${Date.now()}`),
        fetch(rolesUrl)
      ]);
      
      const staffData = await staffRes.json();
      const estData = await estRes.json();
      const rolesData = await rolesRes.json();
      
      setStaff(staffData || []);
      setEstablishments(estData || []);
      setRoles(rolesData || []);

      const initialExpanded: Record<string, boolean> = {};
      (estData || []).forEach((e: any) => { initialExpanded[e.id] = true; });
      setExpandedGroups(initialExpanded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isFullAdmin, session]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Закрытие при смене вкладки
  useEffect(() => { setOpenDropdownId(null); }, [activeTab]);

  const processedData = useMemo(() => {
    const filteredStaff = staff.filter(s => 
      `${s.name || ''} ${s.surname || ''} ${s.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === "unassigned") {
      return filteredStaff.filter(s => !s.establishments || s.establishments.length === 0);
    }

    const groups: Record<string, any[]> = {};
    filteredStaff.filter(s => s.establishments?.length > 0).forEach(s => {
      s.establishments.forEach((est: any) => {
        if (!groups[est.id]) groups[est.id] = [];
        groups[est.id].push(s);
      });
    });

    return establishments.map(est => ({
      id: est.id, name: est.name, address: est.address, city: est.city, items: groups[est.id] || []
    })).filter(g => g.items.length > 0 || (searchQuery === "" && activeTab === "active"));
  }, [staff, establishments, searchQuery, activeTab]);

  const updateAssignments = async (userId: string, selectedEstIds: string[]) => {
    setUpdatingId(userId);
    const prevStaff = [...staff];
    
    setStaff(prev => prev.map(u => u.id === userId ? {
      ...u, establishments: establishments.filter(e => selectedEstIds.includes(e.id))
    } : u));

    try {
      const res = await fetch("/api/partner/all-staff/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, establishmentIds: selectedEstIds }),
      });
      if (res.ok) setOpenDropdownId(null);
      else setStaff(prevStaff);
    } catch (e) {
      setStaff(prevStaff);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateRole = async (userId: string, roleId: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/partner/all-staff/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStaff(prev => prev.map(u => u.id === userId ? { ...u, roleId, newRole: updated.newRole } : u));
      }
    } finally {
      setUpdatingId(null);
      setOpenDropdownId(null);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-[#10b981]" size={40} /></div>;

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-[1400px] mx-auto px-4 uppercase relative">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-5">
          <Link href="/partner/office" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#10b981] shadow-sm"><ArrowLeft size={24} /></Link>
          <h1 className="text-2xl font-bold text-gray-900 leading-none tracking-tight">ШТАТ СОТРУДНИКОВ</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input placeholder="ПОИСК..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toUpperCase())} className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none w-80 shadow-sm uppercase font-bold" />
          </div>
          <Link href="/partner" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#10b981] shadow-sm transition-all"><Home size={22} /></Link>
        </div>
      </header>

      <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/50 ml-2 font-black">
        <button onClick={() => setActiveTab("active")} className={`px-6 py-2.5 rounded-xl text-[10px] transition-all ${activeTab === "active" ? "bg-white text-[#10b981] shadow-sm ring-1 ring-slate-200" : "text-slate-400"}`}>РАСПРЕДЕЛЕНЫ</button>
        <button onClick={() => setActiveTab("unassigned")} className={`px-6 py-2.5 rounded-xl text-[10px] transition-all ${activeTab === "unassigned" ? "bg-white text-rose-500 shadow-sm ring-1 ring-slate-200" : "text-slate-400"}`}>БЕЗ ПРИВЯЗКИ</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-visible">
        <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
          <tbody style={{ overflow: 'visible' }}>
            {activeTab === "unassigned" ? (
              processedData.map((emp: any) => (
                <EmployeeRow 
                  key={`un-${emp.id}`} 
                  groupId="unassigned"
                  employee={emp} roles={roles} establishments={establishments} 
                  openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId} 
                  updateAssignments={updateAssignments} updateRole={updateRole} updatingId={updatingId} 
                />
              ))
            ) : (
              processedData.map((group: any) => (
                <Fragment key={`gr-${group.id}`}>
                  <tr onClick={() => setExpandedGroups(p => ({ ...p, [group.id]: !p[group.id] }))} className="cursor-pointer bg-slate-50 border-b border-gray-100 transition-colors hover:bg-slate-100">
                    <td colSpan={3} className="px-8 py-4 font-bold text-slate-700 uppercase">
                        <ChevronDown size={20} className={`inline mr-2 transition-transform ${expandedGroups[group.id] ? '' : '-rotate-90'}`} />
                        {group.name}
                    </td>
                  </tr>
                  {expandedGroups[group.id] !== false && group.items.map((emp: any) => (
                    <EmployeeRow 
                      key={`as-${group.id}-${emp.id}`} 
                      groupId={group.id}
                      employee={emp} roles={roles} establishments={establishments} 
                      openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId} 
                      updateAssignments={updateAssignments} updateRole={updateRole} updatingId={updatingId} 
                    />
                  ))}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeRow({ employee, groupId, roles, establishments, openDropdownId, setOpenDropdownId, updateAssignments, updateRole, updatingId }: any) {
  const employeeEstIds = employee.establishments?.map((e: any) => e.id) || [];
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Дропдаун открывается только в текущем контексте (сотрудник + группа)
  const currentContextId = `est-${groupId}-${employee.id}`;
  const isOpen = openDropdownId === currentContextId;
  
  const isUpdating = updatingId === employee.id;
  const [estSearch, setEstSearch] = useState("");

  const filteredEsts = useMemo(() => {
    return establishments.filter((e: any) => 
      e.name.toLowerCase().includes(estSearch.toLowerCase()) || 
      e.city.toLowerCase().includes(estSearch.toLowerCase())
    );
  }, [establishments, estSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, setOpenDropdownId]);

  return (
    <tr 
      className="group hover:bg-emerald-50/10 transition-colors border-b border-gray-50 last:border-0 relative" 
      style={{ zIndex: isOpen ? 50 : 1 }}
    >
      <td className="px-10 py-5">
        <Link href={`/profile/${employee.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity w-fit">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 border-slate-100 bg-slate-50 relative overflow-hidden">
            {employee.image ? (
              <Image src={employee.image} alt="" fill className="object-cover" />
            ) : (
              <span className="text-xs font-black text-slate-300">{employee.name?.[0]}{employee.surname?.[0]}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-800 uppercase leading-none">{employee.name} {employee.surname}</span>
            <span className="text-[10px] text-gray-400 lowercase mt-1">{employee.email}</span>
          </div>
        </Link>
      </td>
      
      <td className="px-6 py-5 text-center relative">
        <div className="relative inline-block" ref={dropdownRef}>
          <button 
            disabled={isUpdating} 
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Используем контекстный ID
              setOpenDropdownId(isOpen ? null : currentContextId); 
              setEstSearch(""); 
            }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black ${employeeEstIds.length > 0 ? 'bg-emerald-50 border-emerald-100 text-[#10b981]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
          >
            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <>ОБЪЕКТОВ: {employeeEstIds.length} <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} /></>}
          </button>

          {isOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-gray-100 shadow-2xl rounded-[2rem] p-3 z-[100] animate-in fade-in zoom-in-95">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  autoFocus
                  placeholder="ПОИСК ОБЪЕКТА..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-[10px] font-black outline-none focus:ring-2 ring-emerald-500/20 uppercase"
                  value={estSearch}
                  onChange={(e) => setEstSearch(e.target.value)}
                />
                {estSearch && (
                  <button onClick={() => setEstSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                {filteredEsts.length > 0 ? (
                  filteredEsts.map((est: any) => {
                    const isAssigned = employeeEstIds.includes(est.id);
                    return (
                      <button 
                        key={`est-item-${groupId}-${employee.id}-${est.id}`} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const newIds = isAssigned 
                            ? employeeEstIds.filter((id: string) => id !== est.id) 
                            : [...employeeEstIds, est.id]; 
                          updateAssignments(employee.id, newIds); 
                        }} 
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left uppercase ${isAssigned ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black ${isAssigned ? 'text-emerald-600' : 'text-slate-700'}`}>{est.name}</span>
                          <span className="text-[8px] text-slate-400 font-bold tracking-tight">{est.city}</span>
                        </div>
                        {isAssigned && <Check size={14} className="text-[#10b981] stroke-[3px]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-[9px] font-black text-slate-300 tracking-widest uppercase">Объекты не найдены</div>
                )}
              </div>
            </div>
          )}
        </div>
      </td>

      <td className="px-8 py-5 text-right relative">
        <div className="relative group/select inline-block">
          <select 
            value={employee.roleId || ""} 
            onChange={(e) => updateRole(employee.id, e.target.value)} 
            disabled={isUpdating} 
            className="appearance-none pl-5 pr-12 py-2.5 rounded-xl text-[10px] font-black uppercase border border-slate-200 outline-none bg-white cursor-pointer hover:border-[#10b981] transition-all hover:shadow-sm"
          >
            <option value="" disabled>ВЫБЕРИТЕ РОЛЬ</option>
            {roles.map((r: any) => (
              <option key={`ro-${r.id}-${groupId}-${employee.id}`} value={r.id}>{r.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-emerald-500 transition-colors" />
        </div>
      </td>
    </tr>
  );
}