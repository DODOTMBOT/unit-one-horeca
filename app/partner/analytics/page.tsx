"use client";

import { useState, useEffect, use } from "react";
import { 
  ChevronLeft, ChevronRight, Home, Search, Thermometer, ArrowRight, 
  AlertCircle, LayoutGrid, AlertTriangle, Activity, CheckCircle2, ArrowLeft,
  Users
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PartnerHACCPGlobalAnalyticsPage({ searchParams: searchParamsPromise }: any) {
  const { data: session } = useSession() as any;
  const params = use(searchParamsPromise) as any;
  
  const [activeTab, setActiveTab] = useState<'health' | 'temperature'>('temperature');
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
        const res = await fetch(
          `/api/partner/haccp/summary?month=${currentMonth}&year=${currentYear}&type=${activeTab}&t=${Date.now()}`, 
          { cache: 'no-store' }
        );
        
        if (res.ok) {
          const data = await res.json();
          setEstablishments(data);
        }
      } catch (e) { 
        console.error("Ошибка загрузки аналитики:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    if (session) load();
  }, [currentMonth, currentYear, session, activeTab]);

  const filteredEst = establishments.filter(est => 
    est.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    est.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEst = establishments.length;
  const issueEst = establishments.filter(est => (est.facilitySkipDays?.length || 0) > 0).length;
  const avgCompletion = totalEst > 0 
    ? Math.round(((totalEst - issueEst) / totalEst) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] pb-20 p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP INTERFACE BAR */}
        <header className="flex items-center justify-between mb-20">
          
          {/* ЛЕВАЯ ЧАСТЬ: КНОПКА НАЗАД */}
          <div className="flex-1 flex justify-start">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-all hover:bg-slate-50 flex items-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-400 group-hover:-translate-x-1 transition-transform" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Панель партнёра</p>
            </Link>
          </div>

          {/* ЦЕНТРАЛЬНЫЙ БЛОК */}
          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:block shadow-sm">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Сводная аналитика сети
            </h1>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 shadow-sm flex items-center gap-3"
            >
              <Home size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Главная</p>
            </Link>
          </div>
        </header>

        {/* TABS SELECTOR */}
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit mx-auto mb-10 border border-slate-200 shadow-inner">
            <button 
                onClick={() => setActiveTab('temperature')}
                className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'temperature' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Thermometer size={14} />
                Температуры
            </button>
            <button 
                onClick={() => setActiveTab('health')}
                className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'health' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Users size={14} />
                Журнал здоровья
            </button>
        </div>

        {/* ANALYTICS BLOCKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <LayoutGrid size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Всего заведений</p>
                    <h4 className="text-2xl font-black leading-none text-[#1e1b4b]">{totalEst}</h4>
                </div>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${issueEst > 0 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                    <AlertTriangle size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Проблемные точки</p>
                    <h4 className="text-2xl font-black leading-none text-[#1e1b4b]">{issueEst}</h4>
                </div>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500">
                    <Activity size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Дисциплина сети</p>
                    <h4 className="text-2xl font-black leading-none text-[#1e1b4b]">{avgCompletion}%</h4>
                </div>
            </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text"
              placeholder="ПОИСК ПО ОБЪЕКТАМ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-5 pl-14 pr-8 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-4 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={20} /></Link>
            <div className="px-8 min-w-[180px] text-center font-black uppercase text-[11px] tracking-[0.15em] text-slate-800">
              {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-4 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={20} /></Link>
          </div>
        </div>

        {/* MONITORING TABLE */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                    Синхронизация данных...
                </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Заведение</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center w-56">Статус сегодня</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">История пропусков</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEst.map((est) => {
                    const isExpanded = expandedEst[est.id];
                    const skipDays = est.facilitySkipDays || [];
                    const visibleSkips = isExpanded ? skipDays : skipDays.slice(0, 8);
                    const hasSkips = skipDays.length > 0;

                    return (
                      <tr key={est.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-12 py-8">
                          <Link href={`/partner/establishments/${est.id}/${activeTab}`} className="block">
                            <p className="text-[15px] font-black uppercase tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors leading-none mb-2">{est.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{est.city}</p>
                          </Link>
                        </td>
                        <td className="px-12 py-8 text-center">
                          <div className={`inline-flex items-center justify-center px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest min-w-[130px] border ${
                            est.isFilledToday 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                             {est.isFilledToday ? 'Заполнено' : 'Пропуск'}
                          </div>
                        </td>
                        <td className="px-12 py-8">
                          <div className="flex flex-wrap gap-2 justify-end">
                            {hasSkips ? (
                              <>
                                {visibleSkips.map((day: number) => (
                                  <span key={day} className="w-9 h-9 flex items-center justify-center bg-white border border-rose-100 text-rose-500 rounded-xl text-[11px] font-black shadow-sm">
                                    {day}
                                  </span>
                                ))}
                                {skipDays.length > 8 && (
                                  <button 
                                    onClick={() => setExpandedEst(p => ({...p, [est.id]: !isExpanded}))} 
                                    className="h-9 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 transition-colors"
                                  >
                                    {isExpanded ? '×' : `+${skipDays.length - 8}`}
                                  </button>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-3 text-emerald-500 bg-emerald-50/50 px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                                <CheckCircle2 size={16}/>
                                <span className="text-[11px] font-black uppercase tracking-widest">Дисциплина в норме</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}