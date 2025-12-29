"use client";

import React, { useState, useEffect, use, Fragment } from "react";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Download, Thermometer, MapPin } from "lucide-react";
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
        // 1. Загружаем данные заведения
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
        
        // 2. Загружаем логи температур
        const logsRes = await fetch(`/api/partner/haccp/temperature/monthly?establishmentId=${id}&year=${year}&month=${month}`);
        
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          const formatted: any = {};
          
          // Инициализируем структуру для каждого прибора из актуального списка оборудования
          currentEquip.forEach(eq => {
            formatted[eq.id] = {};
          });
          
          (Array.isArray(logsData) ? logsData : []).forEach((log: any) => {
            const d = new Date(log.date).getDate();
            const shift = log.shift;
            
            // Проверяем наличие прибора в текущем списке (на случай если в логах есть старое оборудование)
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
      } catch (err) { 
        console.error("Критическая ошибка загрузки:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, [id, viewDate]);

  const saveTemperature = async (equipId: string, day: number, shift: number, value: string) => {
    const cleanValue = value.replace(',', '.').trim();
    if (cleanValue === "") return;
    
    // Получаем ID пользователя из сессии для связи в БД
    const userId = session?.user?.id;
    const inspectorName = session?.user?.surname || "Менеджер";

    if (!userId) {
      alert("Ошибка авторизации. Пожалуйста, войдите в систему снова.");
      return;
    }

    const saveDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    saveDate.setHours(0, 0, 0, 0); // Синхронизируем время с логикой API

    // Оптимистичное обновление UI
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
      const response = await fetch("/api/partner/haccp/temperature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establishmentId: id,
          equipmentId: equipId,
          value: cleanValue,
          shift: Number(shift),
          date: saveDate.toISOString(),
          userId: userId // Передаем реальный ID пользователя для Foreign Key
        })
      });

      if (!response.ok) {
        throw new Error("Ошибка при сохранении на сервере");
      }
    } catch (e) {
      console.error("Ошибка сохранения:", e);
      alert("Не удалось сохранить данные на сервере.");
      // Перезагрузка данных в случае ошибки для синхронизации с БД
      window.location.reload();
    }
  };

  const getTempStatus = (value: string, type: string): "ok" | "warning" | "critical" | "none" => {
    const val = parseFloat(value.replace(',', '.'));
    if (isNaN(val)) return "none";
    const deviceType = type?.toLowerCase();
    
    if (deviceType === 'морозильное') {
      return val <= -15 ? "ok" : "critical";
    } else {
      if (val >= 2 && val <= 6) return "ok";
      if ((val >= 0 && val < 2) || (val > 6 && val < 8)) return "warning";
      return "critical";
    }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-20">
      <div className="sticky top-0 z-[70] bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-full px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={`/partner/establishments/${id}`} className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all">
              <ArrowLeft size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-950">В панель</span>
            </Link>
            <div className="h-12 w-[1px] bg-slate-100" />
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-black uppercase tracking-tighter leading-none flex items-center gap-2">
                        <Thermometer className="text-rose-500" size={20} />
                        Температурный режим
                    </h1>
                    {establishmentInfo && (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                            {establishmentInfo.name}
                        </span>
                    )}
                </div>
                {establishmentInfo && (
                    <div className="flex items-center gap-2 mt-2 text-slate-400">
                        <MapPin size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">{establishmentInfo.address}</span>
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <Download size={16} className="text-slate-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Экспорт</span>
            </button>
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400">
                <ChevronLeft size={18} />
              </button>
              <div className="px-6 min-w-[150px] text-center font-black uppercase text-[11px] tracking-[0.15em] text-indigo-600">
                {monthName} {viewDate.getFullYear()}
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
              <th className="sticky left-0 z-[50] bg-white text-left pr-6 pb-6 w-[250px]">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Оборудование</span>
              </th>
              <th className="pb-6 px-4 w-[80px] text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Смена</span>
              </th>
              {Array.from({ length: daysInMonth }).map((_, i) => (
                <th key={i} className="pb-6 px-1 min-w-[45px] text-center">
                  <span className="text-[10px] font-black text-slate-300">{i + 1}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipment.length > 0 ? (
              equipment.map((e) => (
                <Fragment key={e.id}>
                  <tr className="group">
                    <td rowSpan={2} className="sticky left-0 z-[40] bg-white pr-6 py-2 border-b border-slate-50">
                      <div className="h-full flex flex-col justify-center bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-800">{e.name}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                          {e.type?.toLowerCase() === 'морозильное' 
                             ? "Морозильник (≤ -15°C)" 
                             : "Холодильник (+2°C...+6°C)"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-50">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Утро</span>
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
                  <tr className="group border-b border-slate-100">
                    <td className="px-4 py-2 border-b border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Вечер</span>
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
              ))
            ) : (
              <tr>
                <td colSpan={daysInMonth + 2} className="py-20 text-center text-slate-300 uppercase font-black text-[10px] tracking-widest">
                  Оборудование не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeCell && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xs p-8 shadow-2xl animate-in zoom-in duration-150">
            <h3 className="text-sm font-black uppercase tracking-widest text-center mb-6 text-indigo-950">
              Ввод температуры<br/>
              <span className="text-indigo-500 text-[10px]">{activeCell.day} {monthName}, {activeCell.shift === 0 ? 'Утро' : 'Вечер'}</span>
            </h3>
            <div className="mb-6">
              <input 
                autoFocus
                type="text" 
                inputMode="decimal"
                placeholder="°C"
                className="w-full h-16 bg-slate-50 rounded-2xl border-none text-center text-2xl font-black focus:ring-2 ring-indigo-500 transition-all"
                id="temp-input-field"
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
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700"
                >
                    Сохранить
                </button>
                <button onClick={() => setActiveCell(null)} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-xs">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TempCell({ value, isFuture, status, onClick }: { value?: string, isFuture: boolean, status: "ok" | "warning" | "critical" | "none", onClick: () => void }) {
  const getStatusStyles = () => {
    if (isFuture) return 'bg-transparent border-dashed border-slate-100 text-transparent pointer-events-none';
    if (!value) return 'bg-slate-50 border-transparent text-slate-300 hover:bg-white hover:border-slate-200';
    
    switch (status) {
        case "ok": return 'bg-emerald-500 border-emerald-500 text-white';
        case "warning": return 'bg-amber-400 border-amber-400 text-white';
        case "critical": return 'bg-rose-500 border-rose-500 text-white animate-pulse';
        default: return 'bg-white border-slate-200 text-slate-800';
    }
  };

  return (
    <td className="p-1">
      <button 
        disabled={isFuture}
        onClick={onClick}
        className={`w-full h-10 rounded-xl text-[10px] font-black transition-all flex items-center justify-center shadow-sm border ${getStatusStyles()}`}
      >
        {value ? `${value}°` : '-'}
      </button>
    </td>
  );
}