"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Users, ArrowLeft, Loader2, Building2, 
  Check, Star, UserCircle, Search, Hash, 
  ShieldAlert, ShieldCheck, Mail, ChevronDown
} from "lucide-react";
import Link from "next/link";

/**
 * Кастомный компонент селекта для выбора заведения
 */
function CustomEstablishmentSelect({ 
  employee, 
  establishments, 
  onAssign, 
  disabled 
}: { 
  employee: any, 
  establishments: any[], 
  onAssign: (uid: string, eid: string) => void,
  disabled: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentEstId = employee.establishments?.[0]?.id || "";
  const currentEst = establishments.find(e => e.id === currentEstId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex-[2] relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-left z-10 ${
          isOpen 
            ? "bg-white border-blue-600 ring-2 ring-blue-600/10 shadow-sm" 
            : "bg-slate-50 border-transparent hover:border-slate-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3 overflow-hidden pointer-events-none">
          <Building2 size={14} className={currentEst ? "text-blue-600" : "text-slate-400"} />
          <span className={`text-[10px] font-black uppercase tracking-tight truncate ${currentEst ? "text-[#1e1b4b]" : "text-slate-400"}`}>
            {currentEst 
              ? `${currentEst.name} — ${currentEst.city}, ${currentEst.address}` 
              : "Не привязан"}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 shrink-0 pointer-events-none ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-[15px] shadow-2xl z-[100] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => { 
                onAssign(employee.id, ""); // Отправляем пустую строку для отвязки
                setIsOpen(false); 
              }}
              className={`w-full text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-between ${
                !currentEstId ? "text-blue-600 bg-blue-50/50" : "text-slate-400 hover:bg-slate-50 hover:text-red-500"
              }`}
            >
              <span>— Не привязан</span>
              {!currentEstId && <Check size={12} />}
            </button>
            
            <div className="h-[1px] bg-slate-50 my-1" />
            
            {establishments.map((est) => (
              <button
                key={est.id}
                type="button"
                onClick={() => { 
                  onAssign(employee.id, est.id); 
                  setIsOpen(false); 
                }}
                className={`w-full text-left px-4 py-2.5 transition-all flex items-center justify-between group ${
                  currentEstId === est.id ? "bg-blue-50" : "hover:bg-blue-50/50"
                }`}
              >
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className={`text-[10px] font-black uppercase tracking-tight truncate ${
                    currentEstId === est.id ? "text-blue-600" : "text-[#1e1b4b]"
                  }`}>
                    {est.name}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase truncate">
                    {est.city}, {est.address}
                  </span>
                </div>
                {currentEstId === est.id && <Check size={12} className="text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartnerStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/partner/staff").then(res => res.json()),
      fetch("/api/establishments").then(res => res.json())
    ]).then(([staffData, estData]) => {
      setStaff(staffData);
      setEstablishments(estData);
      setLoading(false);
    });
  }, []);

  const filteredStaff = staff.filter(s => 
    `${s.name} ${s.surname}`.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "MANAGER" ? "USER" : "MANAGER";
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/partner/staff/role", {
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

  const assignToEstablishment = async (userId: string, establishmentId: string) => {
    // ВАЖНО: Убрали проверку !establishmentId, чтобы можно было передавать пустую строку
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/partner/staff/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, establishmentId }),
      });
      if (res.ok) {
        const selectedEst = establishments.find(e => e.id === establishmentId);
        // Если заведение не найдено (отвязка), ставим пустой массив
        setStaff(prev => prev.map(u => u.id === userId ? { ...u, establishments: selectedEst ? [selectedEst] : [] } : u));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 pt-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/partner" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#1e1b4b] transition-all">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tighter text-[#1e1b4b]">Штатное расписание</h1>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">{staff.length} чел.</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              placeholder="Поиск сотрудника..." 
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-blue-500 w-[280px] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-visible">
          <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400">
            <div className="w-8 flex justify-center"><Hash size={10} /></div>
            <div className="flex-[1.5]">Сотрудник</div>
            <div className="flex-[2]">Привязка к объекту</div>
            <div className="flex-1">Роль</div>
            <div className="w-[180px] text-right">Управление</div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Загрузка штата...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 overflow-visible">
              {filteredStaff.map((employee, idx) => (
                <div key={employee.id} className="flex flex-col lg:flex-row lg:items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors overflow-visible">
                  
                  <div className="hidden lg:flex w-8 justify-center text-[10px] font-bold text-slate-200">
                    {idx + 1}
                  </div>

                  <div className="flex-[1.5] flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${employee.role === 'MANAGER' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                      {employee.role === 'MANAGER' ? <Star size={18} fill="currentColor" /> : <UserCircle size={18} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black uppercase tracking-tight text-[#1e1b4b]">
                        {employee.name} {employee.surname}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail size={10} />
                        <span className="text-[9px] font-bold lowercase">{employee.email}</span>
                      </div>
                    </div>
                  </div>

                  <CustomEstablishmentSelect 
                    employee={employee}
                    establishments={establishments}
                    onAssign={assignToEstablishment}
                    disabled={updatingId === employee.id}
                  />

                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                      employee.role === 'MANAGER' 
                      ? 'bg-amber-50 border-amber-100 text-amber-600' 
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      {employee.role === 'MANAGER' ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                      {employee.role === 'MANAGER' ? 'Manager' : 'Staff'}
                    </div>
                  </div>

                  <div className="w-full lg:w-[180px] flex justify-end">
                    <button
                      disabled={updatingId === employee.id}
                      onClick={() => toggleRole(employee.id, employee.role)}
                      className={`w-full lg:w-auto px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                        employee.role === 'MANAGER'
                        ? 'bg-white border-red-100 text-red-400 hover:bg-red-50'
                        : 'bg-white border-blue-100 text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {updatingId === employee.id ? <Loader2 size={12} className="animate-spin" /> : (employee.role === 'MANAGER' ? 'Понизить' : 'Сделать упр.')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}