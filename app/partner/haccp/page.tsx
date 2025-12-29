"use client";

import { useState, useEffect, use } from "react";
import { 
  ChevronRight, ArrowLeft, CheckCircle2, ChevronLeft, LogOut, Home
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

  // Конфигурация модулей (плиток)
  const haccpModules = [
    { 
      name: "Журнал здоровья", 
      info: "Допуск персонала", 
      href: "/partner/haccp/health",
      isActive: true 
    },
    { 
      name: "Температуры", 
      info: "Холодильники", 
      href: "/partner/haccp/temperature", // ОБНОВЛЕНА ССЫЛКА
      isActive: true // ТЕПЕРЬ АКТИВЕН (ЗЕЛЕНЫЙ)
    },
    { 
      name: "Фритюрные жиры", 
      info: "Учет масла", 
      href: "#",
      isActive: false
    },
    { 
      name: "Бракераж", 
      info: "Качество блюд", 
      href: "#",
      isActive: false
    }
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/partner/haccp/summary?month=${currentMonth}&year=${currentYear}`, {
          cache: 'no-store'
        });
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

  const filledToday = establishments.filter(e => e.isFilledToday).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] pb-10">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex-1 hidden md:flex" />
          <div className="px-12 py-3 bg-white border border-slate-100 rounded-full shadow-sm text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Журналы HACCP
            </h1>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
            <Link href="/partner" className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-3">
              <Home size={14} className="text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none">Назад</p>
            </Link>
            <Link href="/" className="w-11 h-11 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        {/* MODULES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {haccpModules.map((module, idx) => (
            <Link 
              key={idx} 
              href={module.href} 
              className={`group relative border p-6 rounded-[1.5rem] transition-all flex flex-col justify-center min-h-[100px] overflow-hidden ${
                module.isActive 
                ? "bg-emerald-50/30 border-emerald-200 shadow-sm shadow-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-300" 
                : "bg-white border-slate-100 opacity-60 shadow-sm"
              }`}
            >
              {module.isActive && (
                <div className="absolute top-3 right-4 flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                </div>
              )}

              <h3 className={`text-sm font-black leading-tight mb-1 uppercase tracking-tight ${
                module.isActive ? "text-emerald-900 group-hover:text-emerald-600" : "text-slate-900"
              }`}>
                {module.name}
              </h3>
              <p className={`text-[11px] font-medium uppercase tracking-tighter ${
                module.isActive ? "text-emerald-600/70" : "text-slate-400"
              }`}>
                {module.info}
              </p>
            </Link>
          ))}
        </div>

        {/* --- МОНИТОРИНГ (2 СТОЛБЦА) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-5">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Мониторинг сети</h2>
                <div className="flex items-center gap-4 border-l border-slate-200 pl-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-500">{filledToday}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">ОК</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-500">{establishments.length - filledToday}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">ПРОПУСК</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100">
                <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={16} /></Link>
                <div className="px-3 min-w-[110px] text-center font-black uppercase text-[10px] tracking-widest text-slate-800">
                  {displayDate.toLocaleString('ru-RU', { month: 'short', year: 'numeric' })}
                </div>
                <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={16} /></Link>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Объект</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest w-28 text-center">Статус</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Нарушения</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {establishments.map((est) => {
                    const isExpanded = expandedEst[est.id];
                    const skipDays = est.facilitySkipDays || [];
                    const visibleSkips = isExpanded ? skipDays : skipDays.slice(0, 4);

                    return (
                      <tr key={est.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-5">
                          <Link href={`/partner/establishments/${est.id}/health`} className="block">
                            <p className="text-xs font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-1">{est.name}</p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter leading-none">{est.city}</p>
                          </Link>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl inline-block min-w-[75px] ${est.isFilledToday ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             {est.isFilledToday ? 'ОК' : 'ПРОПУСК'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {skipDays.length > 0 ? (
                              <>
                                {visibleSkips.map((day: number) => (
                                  <span key={day} className="w-6 h-6 flex items-center justify-center bg-white border border-rose-100 text-rose-500 rounded-lg text-[9px] font-black">{day}</span>
                                ))}
                                {skipDays.length > 4 && (
                                  <button onClick={() => setExpandedEst(p => ({...p, [est.id]: !isExpanded}))} className="h-6 px-2 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase">
                                    {isExpanded ? '×' : `+${skipDays.length - 4}`}
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1.5 tracking-tight"><CheckCircle2 size={12}/> Чисто</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[300px] border-dashed text-slate-200">
             <p className="text-[11px] font-black uppercase tracking-[0.2em] italic">Дополнительный мониторинг</p>
          </div>
        </div>
      </div>
    </div>
  );
}