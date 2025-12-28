"use client";

import { useState, useEffect, use } from "react";
import { 
  ChevronRight, ArrowLeft, AlertCircle, 
  CheckCircle2, CalendarDays, ChevronLeft, MapPin, LayoutGrid, ChevronDown, ChevronUp 
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PartnerHACCPPage({ searchParams: searchParamsPromise }: any) {
  const { data: session } = useSession() as any;
  const params = use(searchParamsPromise) as any;
  
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEst, setExpandedEst] = useState<Record<string, boolean>>({});

  const currentMonth = params.month ? parseInt(params.month) : new Date().getMonth();
  const currentYear = params.year ? parseInt(params.year) : new Date().getFullYear();

  const displayDate = new Date(currentYear, currentMonth, 1);
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const nextDate = new Date(currentYear, currentMonth + 1, 1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/partner/haccp/summary?month=${currentMonth}&year=${currentYear}`);
        if (res.ok) {
          const data = await res.json();
          setEstablishments(data);
        }
      } catch (e) {
        console.error("Load failed");
      } finally {
        setLoading(false);
      }
    }
    if (session) load();
  }, [currentMonth, currentYear, session]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Синхронизация данных...</p>
    </div>
  );

  const filledToday = establishments.filter(e => e.isFilledToday).length;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#1e1b4b] pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        
        {/* HEADER */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/partner" className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all text-[10px] font-black uppercase tracking-widest mb-1">
              <ArrowLeft size={14} /> Назад
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tighter">Мониторинг журнала здоровья сети ({establishments.length})</h1>
          </div>
          
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={16} /></Link>
            <div className="px-4 min-w-[160px] text-center font-black uppercase text-[10px] tracking-widest text-indigo-950">
                {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={16} /></Link>
          </div>
        </header>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center font-black text-xs">{filledToday}</div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Заполнено сегодня</p>
              <p className="text-lg font-black tracking-tighter text-indigo-600">{filledToday} / {establishments.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center font-black text-xs">{establishments.length - filledToday}</div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ожидают сегодня</p>
              <p className="text-lg font-black tracking-tighter text-amber-500">{establishments.length - filledToday}</p>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Объект</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Статус</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Пропуски ({displayDate.toLocaleString('ru-RU', { month: 'short' })})</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {establishments.map((est) => {
                const isExpanded = expandedEst[est.id];
                const skipDays = est.facilitySkipDays || [];
                const visibleSkips = isExpanded ? skipDays : skipDays.slice(0, 10);

                return (
                  <tr key={est.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <Link href={`/manager/haccp/health/${est.id}`} className="block">
                        <p className="text-xs font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors mb-1">{est.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                          {est.city}, {est.address}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${est.isFilledToday ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                         {est.isFilledToday ? 'ОК' : 'ПРОПУСК'}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                        {skipDays.length > 0 ? (
                          <>
                            {visibleSkips.map((day: number) => (
                              <span key={day} className="w-6 h-6 flex items-center justify-center bg-rose-50 text-rose-600 rounded-md text-[9px] font-black border border-rose-100/50">{day}</span>
                            ))}
                            {skipDays.length > 10 && (
                              <button 
                                onClick={() => setExpandedEst(p => ({...p, [est.id]: !isExpanded}))}
                                className="h-6 px-2 bg-slate-100 text-slate-500 rounded-md text-[8px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all"
                              >
                                {isExpanded ? 'Скрыть' : `Еще +${skipDays.length - 10}`}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1"><CheckCircle2 size={10}/> Пропусков нет</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <Link href={`/manager/haccp/health/${est.id}`} className="text-slate-300 hover:text-indigo-600"><ChevronRight size={18} /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}