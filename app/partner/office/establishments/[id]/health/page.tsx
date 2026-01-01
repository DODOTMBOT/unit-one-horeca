"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Check, Calendar, Download, Info, X, Activity, Home } from "lucide-react";
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
        const staffRes = await fetch(`/api/partner/haccp/staff/${id}`);
        const staffData = await staffRes.json();
        const validStaff = Array.isArray(staffData) ? staffData : [];
        setEmployees(validStaff);
        
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const logsRes = await fetch(`/api/partner/haccp/health/monthly?establishmentId=${id}&year=${year}&month=${month}`);
        const logsData = await logsRes.json();
        
        const formatted: any = {};
        validStaff.forEach((e: any) => formatted[e.id] = {});
        
        (Array.isArray(logsData) ? logsData : []).forEach((log: any) => {
          const d = new Date(log.date).getDate();
          if (formatted[log.employeeId]) {
            formatted[log.employeeId][d] = {
              status: log.comment,
              inspector: log.inspectorSurname || ""
            };
          }
        });
        setLogs(formatted);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
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
    const isToday = cellDate.getTime() === today.getTime();
    const isPast = cellDate.getTime() < today.getTime();
    const log = logs[empId]?.[day];

    if (isToday || isPast) {
        if (!log || !log.status) {
            updateCell(empId, day, "зд");
        } else {
            setActiveCell({ empId, day });
        }
    }
  };

  const getDayInspector = (day: number) => {
    for (let emp of employees) {
      if (logs[emp.id]?.[day]?.inspector) return logs[emp.id][day].inspector;
    }
    return "";
  };

  const handleExportExcel = () => {
    const rows: any[][] = [];
    const headers = ["Сотрудник"];
    for (let d = 1; d <= daysInMonth; d++) { headers.push(d.toString()); }
    rows.push(headers);

    employees.forEach(emp => {
      const row = [`${emp.name} ${emp.surname}`.toUpperCase()];
      for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        cellDate.setHours(0,0,0,0);
        const log = logs[emp.id]?.[d];
        if (cellDate > today) { row.push(""); } 
        else { row.push((log?.status || "в").toUpperCase()); }
      }
      rows.push(row);
    });

    const signRow = ["ПОДПИСЬ МЕНЕДЖЕРА"];
    for (let d = 1; d <= daysInMonth; d++) {
      const inspector = getDayInspector(d);
      signRow.push(inspector ? inspector.toUpperCase() : "/");
    }
    rows.push(signRow);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Health Log");
    ws["!cols"] = [{ wch: 30 }, ...Array(daysInMonth).fill({ wch: 6 })];
    XLSX.writeFile(wb, `Журнал_здоровья_за_${monthName}.xlsx`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] pb-20">
      
      {/* СТИЛИЗОВАННЫЙ ХЕДЕР ПОД ОБЩИЙ СТИЛЬ АДМИНКИ */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          
          {/* ЛЕВАЯ ЧАСТЬ: КНОПКА ЖУРНАЛЫ ЗДОРОВЬЯ (НАЗАД) */}
          <div className="flex-1 flex justify-start items-center gap-4">
            <Link 
              href="/partner/haccp/health" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-all hover:bg-slate-50 flex items-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Журналы здоровья</p>
            </Link>
            
            <button 
              onClick={() => setShowInfoModal(true)}
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.2rem] shadow-sm flex items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-all"
              title="Памятка"
            >
              <Info size={18} />
            </button>
          </div>
          
          {/* ЦЕНТРАЛЬНЫЙ БЛОК: ТЕКУЩИЙ МЕСЯЦ */}
          <div className="px-10 py-3 bg-white border border-slate-100 rounded-full shadow-sm text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Журнал за {monthName}
            </h1>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: КНОПКИ УПРАВЛЕНИЯ */}
          <div className="flex-1 flex justify-end gap-2">
            <button 
              onClick={handleExportExcel}
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all"
              title="Экспорт в Excel"
            >
              <Download size={18} />
            </button>
            <Link 
              href="/partner" 
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"
            >
              <Home size={18} />
            </Link>
          </div>
        </header>

        {/* ПЕРЕКЛЮЧАТЕЛЬ МЕСЯЦА */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-8 min-w-[220px] text-center font-black uppercase text-[11px] tracking-[0.15em] text-slate-800 flex flex-col">
              <span>{monthName} {viewDate.getFullYear()}</span>
              <span className="text-[8px] text-emerald-500 font-bold tracking-normal mt-0.5 flex items-center justify-center gap-1">
                <Calendar size={8} /> Сегодня: {today.toLocaleDateString('ru-RU')}
              </span>
            </div>
            <button 
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* ТАБЛИЦА ЖУРНАЛА */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-[50] bg-white text-left px-10 py-8 w-[300px] border-b border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Сотрудник</span>
                  </th>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                    date.setHours(0,0,0,0);
                    const isToday = date.getTime() === today.getTime();
                    return (
                      <th key={i} className={`py-8 px-1 min-w-[46px] text-center border-b border-slate-50 ${isToday ? 'scale-110' : ''}`}>
                        <span className={`text-[11px] font-black ${isToday ? 'text-indigo-600 underline decoration-2 underline-offset-4' : 'text-slate-300'}`}>
                            {i + 1}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="group">
                    <td className="sticky left-0 z-[40] bg-white px-10 py-3">
                      <div className="h-12 flex items-center bg-white border border-slate-100 rounded-[1.2rem] px-5 shadow-sm group-hover:border-indigo-100 transition-all">
                        <span className="text-[12px] font-black uppercase tracking-tight text-slate-800 whitespace-nowrap">
                          {emp.name} {emp.surname}
                        </span>
                      </div>
                    </td>
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                      cellDate.setHours(0,0,0,0);
                      const isToday = cellDate.getTime() === today.getTime();
                      const isFuture = cellDate.getTime() > today.getTime();
                      const log = logs[emp.id]?.[day];
                      const status = log?.status;
                      const displayStatus = isFuture ? "" : (status || "в");
                      const config = STATUSES.find(s => s.code === displayStatus);
                      
                      return (
                        <td key={i} className="p-1 relative">
                          <button 
                            disabled={isFuture}
                            onClick={() => handleCellClick(emp.id, day)}
                            className={`w-full h-11 rounded-[1rem] text-[10px] font-black transition-all flex items-center justify-center shadow-sm 
                            ${isFuture 
                                ? 'bg-transparent border border-dashed border-slate-100 cursor-default text-transparent shadow-none' 
                                : config 
                                    ? config.color 
                                    : 'bg-white border border-slate-100 text-slate-200 hover:border-indigo-200'}
                            ${isToday && !status ? 'ring-2 ring-indigo-200 ring-offset-2' : ''}`}
                          >
                            {displayStatus}
                          </button>

                          {activeCell?.empId === emp.id && activeCell?.day === day && (
                            <div className="fixed mt-2 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] z-[100] p-3 flex flex-col gap-1 min-w-[180px] animate-in fade-in slide-in-from-top-2">
                              {STATUSES.map(s => (
                                <button key={s.code} onClick={() => updateCell(emp.id, day, s.code)} className="px-4 py-2.5 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase text-left flex items-center justify-between transition-colors group/btn">
                                  <span className="text-slate-600 group-hover/btn:text-indigo-600">{s.label}</span>
                                  {status === s.code && <Check size={14} className="text-indigo-600" />}
                                </button>
                              ))}
                              <div className="h-[1px] bg-slate-50 my-1.5 mx-2" />
                              <button onClick={() => updateCell(emp.id, day, "")} className="px-4 py-2.5 hover:bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase text-left transition-colors">Очистить</button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr>
                  <td className="sticky left-0 z-[40] bg-white px-10 pt-12 pb-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600/40">Подпись менеджера</span>
                  </td>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const inspector = getDayInspector(day);
                    return (
                      <td key={i} className="pt-12 px-1 text-center align-top border-t border-slate-50">
                        {inspector ? (
                          <div className="flex flex-col items-center gap-2 opacity-80">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter leading-none w-[42px] truncate">
                              {inspector}
                            </span>
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-sm" />
                          </div>
                        ) : (
                          <span className="text-slate-100 text-[11px] font-black">/</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПАМЯТКИ */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-[#1e1b4b]">Инструкция заполнения</h2>
                        <button onClick={() => setShowInfoModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
                        <div className="p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
                            <p className="font-black text-emerald-700 uppercase text-[10px] tracking-widest mb-2">Быстрое заполнение:</p>
                            Одиночное нажатие на пустую ячейку сотрудника автоматически ставит статус <span className="font-black text-emerald-700">"ЗД" (Здоров)</span> и подпись ответственного лица.
                        </div>
                        <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100">
                            <p className="font-black text-amber-700 uppercase text-[10px] tracking-widest mb-2">Изменение статуса:</p>
                            Для изменения (отпуск, больничный и др.) нажмите на уже заполненную ячейку для вызова меню выбора.
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowInfoModal(false)}
                        className="w-full mt-10 py-5 bg-[#1e1b4b] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200"
                    >
                        Все понятно
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ФИКСИРОВАННАЯ ЛЕГЕНДА СТАТУСОВ */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-slate-100 shadow-2xl z-[60]">
         {STATUSES.map(s => (
           <div key={s.code} className="flex items-center gap-3 px-4 border-r last:border-0 border-slate-100">
             <div className={`w-2.5 h-2.5 rounded-full ${s.color} shadow-sm`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
}