"use client";

import React, { useState, useEffect, use, Fragment } from "react";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Download, Thermometer, MapPin, Home, Calendar, Info, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MonthlyTemperatureLog({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: session } = useSession() as any;
  
  const [viewDate, setViewDate] = useState(new Date());
  const [equipment, setEquipment] = useState<any[]>([]);
  const [establishmentInfo, setEstablishmentInfo] = useState<{name: string, address: string} | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [logs, setLogs] = useState<Record<string, Record<number, Record<number, {value: string, inspector: string}>>>>({});
  const [activeCell, setActiveCell] = useState<{equipId: string, day: number, shift: number} | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const monthName = viewDate.toLocaleString('ru-RU', { month: 'long' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/establishments/${id}`);
        let currentEquip: any[] = [];
        
        if (res.ok) {
          const data = await res.json();
          setEstablishmentInfo({
            name: data.name || "Название не указано",
            address: data.address || "Адрес не указан"
          });
          currentEquip = Array.isArray(data.equipment) ? data.equipment : [];
          setEquipment(currentEquip);
        }
        
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const logsRes = await fetch(`/api/partner/haccp/temperature/monthly?establishmentId=${id}&year=${year}&month=${month}`);
        
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          const formatted: any = {};
          currentEquip.forEach(eq => { formatted[eq.id] = {}; });
          
          (Array.isArray(logsData) ? logsData : []).forEach((log: any) => {
            const d = new Date(log.date).getDate();
            const shift = log.shift;
            if (formatted[log.equipmentId]) {
              if (!formatted[log.equipmentId][d]) formatted[log.equipmentId][d] = {};
              formatted[log.equipmentId][d][shift] = {
                value: log.value?.toString() || "",
                inspector: log.inspectorSurname || ""
              };
            }
          });
          setLogs(formatted);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, [id, viewDate]);

  const saveTemperature = async (equipId: string, day: number, shift: number, value: string) => {
    const cleanValue = value.replace(',', '.').trim();
    if (cleanValue === "") return;
    
    const userId = session?.user?.id;
    const inspectorName = session?.user?.surname || "Менеджер";

    if (!userId) {
      alert("Ошибка авторизации.");
      return;
    }

    const saveDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    saveDate.setHours(0, 0, 0, 0);

    setLogs(prev => ({
      ...prev,
      [equipId]: {
        ...(prev[equipId] || {}),
        [day]: {
          ...(prev[equipId]?.[day] || {}),
          [shift]: { value: cleanValue, inspector: inspectorName }
        }
      }
    }));
    setActiveCell(null);

    try {
      await fetch("/api/partner/haccp/temperature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establishmentId: id,
          equipmentId: equipId,
          value: cleanValue,
          shift: Number(shift),
          date: saveDate.toISOString(),
          userId: userId
        })
      });
    } catch (e) { console.error(e); }
  };

  const getTempStatus = (value: string, type: string): "ok" | "warning" | "critical" | "none" => {
    const val = parseFloat(value.replace(',', '.'));
    if (isNaN(val)) return "none";
    const deviceType = type?.toLowerCase();
    if (deviceType === 'морозильное') return val <= -15 ? "ok" : "critical";
    if (val >= 2 && val <= 6) return "ok";
    if ((val >= 0 && val < 2) || (val > 6 && val < 8)) return "warning";
    return "critical";
  };

  const handleExportExcel = () => {
    const rows: any[][] = [];
    const h1 = ["Оборудование", "Смена"];
    for (let d = 1; d <= daysInMonth; d++) { h1.push(d.toString()); }
    rows.push(h1);
    equipment.forEach(e => {
      const rowMorning = [e.name.toUpperCase(), "УТРО"];
      const rowEvening = ["", "ВЕЧЕР"];
      for (let d = 1; d <= daysInMonth; d++) {
        rowMorning.push(logs[e.id]?.[d]?.[0]?.value || "-");
        rowEvening.push(logs[e.id]?.[d]?.[1]?.value || "-");
      }
      rows.push(rowMorning, rowEvening);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Temperature Log");
    XLSX.writeFile(wb, `Журнал_температур_${establishmentInfo?.name || id}_${monthName}.xlsx`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] pb-20">
      
      {/* СТИЛИЗОВАННЫЙ ХЕДЕР ПОД ОБЩИЙ СТИЛЬ АДМИНКИ */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          
          {/* ЛЕВАЯ ЧАСТЬ: НАЗАД В ЖУРНАЛЫ ТЕМПЕРАТУР */}
          <div className="flex-1 flex justify-start items-center gap-4">
            <Link 
              href="/partner/haccp/temperature" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 flex items-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Журналы температур</p>
            </Link>
          </div>
          
          {/* ЦЕНТРАЛЬНЫЙ БЛОК: ТИТУЛ */}
          <div className="px-10 py-3 bg-white border border-slate-100 rounded-full shadow-sm text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Журнал: {establishmentInfo?.name}
            </h1>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: КНОПКИ УПРАВЛЕНИЯ */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <button 
              onClick={handleExportExcel}
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center justify-center text-slate-300 hover:text-emerald-600 transition-colors"
              title="Экспорт в Excel"
            >
              <Download size={18} />
            </button>
            <Link 
              href="/partner" 
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-colors"
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
              <span className="text-[8px] text-emerald-500 font-bold tracking-normal mt-0.5 flex items-center justify-center gap-1 leading-none">
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
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Оборудование</span>
                  </th>
                  <th className="px-4 py-8 border-b border-slate-50 text-left w-[80px]">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Смена</span>
                  </th>
                  {Array.from({ length: daysInMonth }).map((_, i) => (
                    <th key={i} className="py-8 px-1 min-w-[46px] text-center border-b border-slate-50">
                      <span className={`text-[11px] font-black ${new Date(viewDate.getFullYear(), viewDate.getMonth(), i+1).getTime() === today.getTime() ? 'text-indigo-600 underline decoration-2 underline-offset-4' : 'text-slate-300'}`}>
                          {i + 1}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {equipment.map((e) => (
                  <Fragment key={e.id}>
                    <tr className="group">
                      <td rowSpan={2} className="sticky left-0 z-[40] bg-white px-10 py-4 border-b border-slate-50">
                        <div className="flex flex-col justify-center bg-white border border-slate-100 rounded-[1.2rem] px-5 py-3 shadow-sm transition-all group-hover:border-indigo-100">
                          <span className="text-[12px] font-black uppercase tracking-tight text-slate-800">{e.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1 leading-none">
                            {e.type?.toLowerCase() === 'морозильное' ? "Морозильник (≤ -15°C)" : "Холодильник (+2...+6°C)"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-b border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Утро</span>
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const log = logs[e.id]?.[day]?.[0];
                        const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                        const isFuture = cellDate > today;
                        const status = getTempStatus(log?.value || "", e.type);
                        return (
                          <TempCell 
                            key={`${e.id}-${day}-0`}
                            value={log?.value}
                            isFuture={isFuture}
                            status={status}
                            onClick={() => !isFuture && setActiveCell({ equipId: e.id, day, shift: 0 })}
                          />
                        );
                      })}
                    </tr>
                    <tr className="group">
                      <td className="px-4 py-4 border-b border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Вечер</span>
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const log = logs[e.id]?.[day]?.[1];
                        const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                        const isFuture = cellDate > today;
                        const status = getTempStatus(log?.value || "", e.type);
                        return (
                          <TempCell 
                            key={`${e.id}-${day}-1`}
                            value={log?.value}
                            isFuture={isFuture}
                            status={status}
                            onClick={() => !isFuture && setActiveCell({ equipId: e.id, day, shift: 1 })}
                          />
                        );
                      })}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ВВОДА */}
      {activeCell && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xs overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-10">
              <h3 className="text-sm font-black uppercase tracking-widest text-center mb-2 text-[#1e1b4b]">
                Ввод температуры
              </h3>
              <p className="text-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-8">
                {activeCell.day} {monthName}, {activeCell.shift === 0 ? 'УТРО' : 'ВЕЧЕР'}
              </p>
              
              <div className="mb-8">
                <input 
                  autoFocus
                  type="text" 
                  inputMode="decimal"
                  placeholder="°C"
                  id="temp-input-field"
                  className="w-full h-16 bg-slate-50 rounded-2xl border-none text-center text-3xl font-black focus:ring-2 ring-indigo-500 transition-all placeholder:text-slate-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveTemperature(activeCell.equipId, activeCell.day, activeCell.shift, (e.target as HTMLInputElement).value);
                    }
                    if (e.key === 'Escape') setActiveCell(null);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                  <button 
                      onClick={() => {
                          const val = (document.getElementById('temp-input-field') as HTMLInputElement).value;
                          saveTemperature(activeCell.equipId, activeCell.day, activeCell.shift, val);
                      }}
                      className="w-full py-5 bg-[#1e1b4b] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200"
                  >
                      Сохранить
                  </button>
                  <button onClick={() => setActiveCell(null)} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TempCell({ value, isFuture, status, onClick }: { value?: string, isFuture: boolean, status: "ok" | "warning" | "critical" | "none", onClick: () => void }) {
  const getStatusStyles = () => {
    if (isFuture) return 'bg-transparent border-dashed border-slate-100 text-transparent pointer-events-none shadow-none';
    if (!value) return 'bg-slate-50 border-transparent text-slate-300 hover:bg-white hover:border-slate-200';
    
    switch (status) {
        case "ok": return 'bg-emerald-500 border-emerald-500 text-white';
        case "warning": return 'bg-amber-400 border-amber-400 text-white';
        case "critical": return 'bg-rose-500 border-rose-500 text-white animate-pulse shadow-rose-200';
        default: return 'bg-white border-slate-200 text-slate-800';
    }
  };

  return (
    <td className="p-1">
      <button 
        disabled={isFuture}
        onClick={onClick}
        className={`w-full h-11 rounded-xl text-[10px] font-black transition-all flex items-center justify-center shadow-sm border ${getStatusStyles()}`}
      >
        {value ? `${value}°` : '-'}
      </button>
    </td>
  );
}