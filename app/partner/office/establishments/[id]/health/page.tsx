"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Check, Calendar, Download, Info, X, Home } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";

const STATUSES = [
  { code: "зд", label: "ЗДОРОВ", color: "bg-emerald-500 text-white" },
  { code: "отст", label: "ОТСТРАНЕН", color: "bg-rose-500 text-white" },
  { code: "отп", label: "ОТПУСК", color: "bg-sky-500 text-white" },
  { code: "в", label: "ВЫХОДНОЙ", color: "bg-slate-100 text-slate-400" },
  { code: "б/л", label: "БОЛЬНИЧНЫЙ", color: "bg-amber-500 text-white" },
];

export default function MonthlyHealthLog({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: session } = useSession() as any;
  
  const [viewDate, setViewDate] = useState(new Date());
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Record<string, Record<number, {status: string, inspector: string}>>>({});
  const [activeCell, setActiveCell] = useState<{empId: string, day: number} | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const monthName = viewDate.toLocaleString('ru-RU', { month: 'long' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Загружаем сотрудников точки (с защитой от кеша)
        const staffRes = await fetch(`/api/partner/haccp/staff/${id}?t=${Date.now()}`);
        const staffData = await staffRes.json();
        const validStaff = Array.isArray(staffData) ? staffData : [];
        setEmployees(validStaff);
        
        // 2. Загружаем логи за месяц
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const logsRes = await fetch(`/api/partner/haccp/health/monthly?establishmentId=${id}&year=${year}&month=${month}&t=${Date.now()}`);
        const logsData = await logsRes.json();
        
        const formatted: any = {};
        validStaff.forEach((e: any) => formatted[e.id] = {});
        
        if (Array.isArray(logsData)) {
          logsData.forEach((log: any) => {
            const d = new Date(log.date).getDate();
            if (formatted[log.employeeId]) {
              formatted[log.employeeId][d] = {
                status: log.comment,
                inspector: log.inspectorSurname || ""
              };
            }
          });
        }
        setLogs(formatted);
      } catch (err) { 
        console.error("DATA_LOAD_ERROR:", err);
        setEmployees([]);
      } finally { setLoading(false); }
    };
    loadData();
  }, [id, viewDate]);

  const updateCell = async (empId: string, day: number, code: string) => {
    const inspectorName = session?.user?.surname || "Менеджер";
    setLogs(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [day]: { status: code, inspector: inspectorName } }
    }));
    setActiveCell(null);

    await fetch("/api/partner/haccp/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        establishmentId: id,
        employeeId: empId,
        comment: code,
        date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString()
      })
    });
  };

  const handleCellClick = (empId: string, day: number) => {
    const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    cellDate.setHours(0,0,0,0);
    if (cellDate <= today) {
        const log = logs[empId]?.[day];
        if (!log || !log.status) updateCell(empId, day, "зд");
        else setActiveCell({ empId, day });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] pb-20">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-10">
          <Link href="/partner/haccp/health" className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all uppercase text-xs font-black">
            <ArrowLeft size={16} /> Журналы здоровья
          </Link>
          <div className="px-10 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <h1 className="text-xs font-black uppercase tracking-[0.2em]">Журнал за {monthName}</h1>
          </div>
          <Link href="/partner" className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center shadow-sm"><Home size={18} /></Link>
        </header>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-[50] bg-white text-left px-10 py-8 w-[300px] border-b border-slate-50 font-black uppercase text-[10px] text-slate-300">Сотрудник</th>
                  {Array.from({ length: daysInMonth }).map((_, i) => (
                    <th key={i} className="py-8 px-1 min-w-[46px] text-center border-b border-slate-50 font-black text-[11px] text-slate-300">{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? employees.map((emp) => (
                  <tr key={emp.id} className="group">
                    <td className="sticky left-0 z-[40] bg-white px-10 py-3">
                      <div className="h-12 flex items-center bg-white border border-slate-100 rounded-[1.2rem] px-5 shadow-sm">
                        <span className="text-[12px] font-black uppercase">{emp.name} {emp.surname}</span>
                      </div>
                    </td>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                      cellDate.setHours(0,0,0,0);
                      const isFuture = cellDate > today;
                      const log = logs[emp.id]?.[day];
                      const config = STATUSES.find(s => s.code === (log?.status || (isFuture ? "" : "в")));
                      return (
                        <td key={i} className="p-1 relative">
                          <button disabled={isFuture} onClick={() => handleCellClick(emp.id, day)}
                            className={`w-full h-11 rounded-[1rem] text-[10px] font-black transition-all flex items-center justify-center shadow-sm 
                            ${isFuture ? 'bg-transparent border border-dashed border-slate-100' : (config ? config.color : 'bg-white border border-slate-100 text-slate-200')}`}>
                            {isFuture ? "" : (log?.status || "в")}
                          </button>
                          {activeCell?.empId === emp.id && activeCell?.day === day && (
                            <div className="fixed mt-2 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] z-[100] p-3 flex flex-col gap-1 min-w-[180px]">
                              {STATUSES.map(s => (
                                <button key={s.code} onClick={() => updateCell(emp.id, day, s.code)} className="px-4 py-2.5 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase text-left flex items-center justify-between transition-colors">
                                  <span>{s.label}</span>
                                  {log?.status === s.code && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                  <tr><td colSpan={daysInMonth + 1} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Персонал не найден</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}