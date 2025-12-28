"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Check, Calendar, Download, Info, X } from "lucide-react";
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-20">
      
      {/* ПАНЕЛЬ НАВИГАЦИИ */}
      <div className="sticky top-0 z-[70] bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-full px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/manager/haccp" className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all">
              <ArrowLeft size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-950">Назад</span>
            </Link>
            <button 
                onClick={() => setShowInfoModal(true)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                <Info size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">Памятка</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-100" />
            <div>
                <h1 className="text-lg font-black uppercase tracking-tighter">Журнал здоровья</h1>
                <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 uppercase leading-none">
                    <Calendar size={10} />
                    Сегодня: {today.toLocaleDateString('ru-RU')}
                </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
            >
              <Download size={16} className="text-slate-400 group-hover:text-indigo-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 italic">
                Выгрузить за {monthName}
              </span>
            </button>

            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400">
                <ChevronLeft size={18} />
              </button>
              <div className="px-6 min-w-[150px] text-center">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  {monthName} {viewDate.getFullYear()}
                </span>
              </div>
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto px-8 py-10">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {/* Исправлен z-index и добавлен bg-white для предотвращения просвечивания */}
              <th className="sticky left-0 z-[50] bg-white text-left pr-6 pb-6 w-[280px]">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Сотрудник</span>
              </th>
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                date.setHours(0,0,0,0);
                const isToday = date.getTime() === today.getTime();
                return (
                  <th key={i} className={`pb-6 px-1 min-w-[42px] text-center ${isToday ? 'scale-110' : ''}`}>
                    <span className={`text-[10px] font-black ${isToday ? 'text-indigo-600 underline decoration-2 underline-offset-4' : 'text-slate-300'}`}>
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
                {/* Исправлен z-index и добавлен bg-white */}
                <td className="sticky left-0 z-[40] bg-white pr-6 py-2">
                  <div className="h-10 flex items-center bg-white border border-slate-100 rounded-xl px-4 shadow-sm group-hover:border-indigo-100 transition-all">
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-800 whitespace-nowrap">
                      {emp.name} {emp.surname}
                    </span>
                  </div>
                </td>
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  cellDate.setHours(0,0,0,0);
                  const isToday = cellDate.getTime() === today.getTime();
                  const isPast = cellDate.getTime() < today.getTime();
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
                        className={`w-full h-10 rounded-xl text-[9px] font-black transition-all flex items-center justify-center shadow-sm 
                        ${isFuture 
                            ? 'bg-transparent border border-dashed border-slate-100 cursor-default text-transparent shadow-none' 
                            : config 
                                ? config.color 
                                : 'bg-white border border-slate-100 text-slate-200'}
                        ${isToday && !status ? 'ring-2 ring-indigo-200 ring-offset-2' : ''}`}
                      >
                        {displayStatus}
                      </button>

                      {activeCell?.empId === emp.id && activeCell?.day === day && (
                        <div className="fixed mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[100] p-2 flex flex-col gap-1 min-w-[160px] animate-in fade-in slide-in-from-top-2">
                          {STATUSES.map(s => (
                            <button key={s.code} onClick={() => updateCell(emp.id, day, s.code)} className="px-4 py-2 hover:bg-slate-50 rounded-lg text-[9px] font-black uppercase text-left flex items-center justify-between transition-colors">
                              <span className="text-slate-600">{s.label}</span>
                              {status === s.code && <Check size={12} className="text-indigo-600" />}
                            </button>
                          ))}
                          <div className="h-[1px] bg-slate-50 my-1 mx-2" />
                          <button onClick={() => updateCell(emp.id, day, "")} className="px-4 py-2 hover:bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase text-left transition-colors">Очистить</button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              {/* Исправлен z-index и добавлен bg-white для нижней подписи */}
              <td className="sticky left-0 z-[40] bg-white pr-6 pt-10 pb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600/50">Подпись менеджера</span>
              </td>
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const inspector = getDayInspector(day);
                return (
                  <td key={i} className="pt-10 px-1 text-center align-top">
                    {inspector ? (
                      <div className="flex flex-col items-center gap-1.5 opacity-80">
                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter leading-none w-[38px] truncate">
                          {inspector}
                        </span>
                        <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                      </div>
                    ) : (
                      <span className="text-slate-100 text-[10px]">/</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПАМЯТКИ */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Памятка по заполнению</h2>
                        <button onClick={() => setShowInfoModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="font-bold text-emerald-700 mb-1">1. Быстрое заполнение (Текущий день):</p>
                            Одиночное нажатие на пустую ячейку сотрудника автоматически ставит статус <span className="font-bold">"ЗД" (Здоров)</span> и вашу электронную подпись.
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <p className="font-bold text-indigo-700 mb-1">2. Смена статуса:</p>
                            Если ячейка уже заполнена, нажатие на неё откроет меню выбора. Вы можете выбрать: Отпуск, Выходной, Больничный или Отстранение.
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="font-bold text-slate-700 mb-1">3. Обозначения:</p>
                            <ul className="list-disc ml-5 space-y-1">
                                <li><span className="font-bold text-emerald-600">ЗД</span> — Здоров, допущен к работе.</li>
                                <li><span className="font-bold text-rose-600">ОТСТ</span> — Отстранен (признаки болезни).</li>
                                <li><span className="font-bold text-slate-400">В</span> — Выходной (проставляется автоматически для прошлых дат).</li>
                                <li><span className="font-bold text-amber-600">Б/Л</span> — Официальный больничный.</li>
                            </ul>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowInfoModal(false)}
                        className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors"
                    >
                        Понятно
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ЛЕГЕНДА */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 shadow-xl z-50">
         {STATUSES.map(s => (
           <div key={s.code} className="flex items-center gap-2 px-3 border-r last:border-0 border-slate-100">
             <div className={`w-2 h-2 rounded-full ${s.color}`} />
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
}