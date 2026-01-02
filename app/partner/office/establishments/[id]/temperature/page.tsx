"use client";

import React, { useState, useEffect, use, Fragment } from "react";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Download, Home, Calendar, Check } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function MonthlyTemperatureLog({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: session } = useSession() as any;
  
  const [viewDate, setViewDate] = useState(new Date());
  const [equipment, setEquipment] = useState<any[]>([]);
  const [establishmentInfo, setEstablishmentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Record<string, Record<number, Record<number, {value: string}>>>>({});
  const [activeCell, setActiveCell] = useState<{equipId: string, day: number, shift: number} | null>(null);

  const today = new Date();
  today.setHours(0,0,0,0);
  const monthName = viewDate.toLocaleString('ru-RU', { month: 'long' });
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Загружаем данные заведения (включая оборудование)
        const res = await fetch(`/api/establishments/${id}?t=${Date.now()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEstablishmentInfo(data);
        const currentEquip = data.equipment || [];
        setEquipment(currentEquip);

        // Загружаем логи
        const logsRes = await fetch(`/api/partner/haccp/temperature/monthly?establishmentId=${id}&year=${viewDate.getFullYear()}&month=${viewDate.getMonth()}&t=${Date.now()}`);
        const logsData = await logsRes.json();
        
        const formatted: any = {};
        currentEquip.forEach((eq: any) => formatted[eq.id] = {});
        if (Array.isArray(logsData)) {
          logsData.forEach((log: any) => {
            const d = new Date(log.date).getDate();
            if (formatted[log.equipmentId]) {
              if (!formatted[log.equipmentId][d]) formatted[log.equipmentId][d] = {};
              formatted[log.equipmentId][d][log.shift] = { value: log.value };
            }
          });
        }
        setLogs(formatted);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, [id, viewDate]);

  const saveTemperature = async (equipId: string, day: number, shift: number, value: string) => {
    const saveDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    saveDate.setHours(0,0,0,0);
    
    setLogs(prev => ({
      ...prev,
      [equipId]: { ...prev[equipId], [day]: { ...prev[equipId][day], [shift]: { value } } }
    }));
    setActiveCell(null);

    await fetch("/api/partner/haccp/temperature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ establishmentId: id, equipmentId: equipId, value, shift, date: saveDate.toISOString(), userId: session?.user?.id })
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] pb-20">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-10">
          <Link href="/partner/haccp/temperature" className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm uppercase text-xs font-black flex items-center gap-3">
            <ArrowLeft size={16} /> Журналы температур
          </Link>
          <div className="px-10 py-3 bg-white border border-slate-100 rounded-full shadow-sm text-xs font-black uppercase">
            {establishmentInfo?.name} — {monthName}
          </div>
          <Link href="/partner" className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center shadow-sm"><Home size={18} /></Link>
        </header>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-[50] bg-white text-left px-10 py-8 w-[250px] border-b border-slate-50 font-black uppercase text-[10px] text-slate-300">Оборудование</th>
                  <th className="px-4 py-8 border-b border-slate-50 font-black uppercase text-[10px] text-slate-300">Смена</th>
                  {Array.from({ length: daysInMonth }).map((_, i) => (
                    <th key={i} className="py-8 px-1 min-w-[46px] text-center border-b border-slate-50 font-black text-[11px] text-slate-300">{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipment.length > 0 ? equipment.map((e) => (
                  <Fragment key={e.id}>
                    {[0, 1].map((shift) => (
                      <tr key={`${e.id}-${shift}`} className="group">
                        {shift === 0 && <td rowSpan={2} className="sticky left-0 z-[40] bg-white px-10 py-4 border-b border-slate-50">
                          <span className="text-[12px] font-black uppercase">{e.name}</span>
                        </td>}
                        <td className="px-4 py-4 border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase">{shift === 0 ? "Утро" : "Вечер"}</td>
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                          const isFuture = cellDate > today;
                          const log = logs[e.id]?.[day]?.[shift];
                          return (
                            <td key={i} className="p-1 text-center">
                              <button disabled={isFuture} onClick={() => setActiveCell({ equipId: e.id, day, shift })}
                                className={`w-full h-11 rounded-xl text-[10px] font-black border transition-all 
                                ${isFuture ? 'bg-transparent border-dashed border-slate-100 text-transparent' : (log?.value ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-transparent text-slate-300')}`}>
                                {log?.value ? `${log.value}°` : "-"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                )) : (
                  <tr><td colSpan={daysInMonth + 2} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Оборудование не найдено</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {activeCell && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xs p-10 shadow-2xl">
            <h3 className="text-sm font-black uppercase text-center mb-8">Ввод температуры</h3>
            <input autoFocus type="text" inputMode="decimal" placeholder="°C" id="temp-input" className="w-full h-16 bg-slate-50 rounded-2xl text-center text-3xl font-black mb-8 focus:ring-2 ring-indigo-500 outline-none" />
            <button onClick={() => saveTemperature(activeCell.equipId, activeCell.day, activeCell.shift, (document.getElementById('temp-input') as HTMLInputElement).value)}
              className="w-full py-5 bg-[#1e1b4b] text-white rounded-[1.5rem] font-black uppercase text-xs hover:bg-indigo-600 transition-all">Сохранить</button>
            <button onClick={() => setActiveCell(null)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] mt-2">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}