"use client";

import { useState, useEffect, use } from "react";
import { 
  ChevronLeft, ChevronRight, Home, Search, Thermometer, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PartnerHACCPTemperatureListPage({ searchParams: searchParamsPromise }: any) {
  const { data: session } = useSession() as any;
  const params = use(searchParamsPromise) as any;
  
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const currentMonth = params.month ? parseInt(params.month) : new Date().getMonth();
  const currentYear = params.year ? parseInt(params.year) : new Date().getFullYear();

  const displayDate = new Date(currentYear, currentMonth, 1);
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const nextDate = new Date(currentYear, currentMonth + 1, 1);

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
        console.error("Ошибка загрузки данных:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    if (session) load();
  }, [currentMonth, currentYear, session]);

  const filteredEst = establishments.filter(est => 
    est.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    est.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] pb-20">
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex-1">
            <Link href="/partner/haccp" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
              <span className="text-[10px] font-black uppercase tracking-widest">Назад в HACCP</span>
            </Link>
          </div>
          
          <div className="px-10 py-3 bg-white border border-slate-100 rounded-full shadow-sm text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Выбор заведения: Температурный режим
            </h1>
          </div>

          <div className="flex-1 flex justify-end gap-2">
            <Link href="/partner" className="w-11 h-11 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">
              <Home size={18} />
            </Link>
          </div>
        </header>

        {/* CONTROLS: SEARCH & CALENDAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="ПОИСК ЗАВЕДЕНИЯ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-4 pl-12 pr-6 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={20} /></Link>
            <div className="px-6 min-w-[160px] text-center font-black uppercase text-[11px] tracking-[0.15em] text-slate-800">
              {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={20} /></Link>
          </div>
        </div>

        {/* LIST OF ESTABLISHMENTS */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Загрузка сети...</p>
            </div>
          ) : filteredEst.length > 0 ? (
            filteredEst.map((est) => (
              <Link 
                key={est.id} 
                href={`/partner/establishments/${est.id}/temperature`}
                className="group bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${est.isFilledToday ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    <Thermometer size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors leading-none mb-2">
                      {est.name}
                    </h3>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{est.city}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full" />
                       <span className={`text-[9px] font-black uppercase ${est.isFilledToday ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {est.isFilledToday ? 'Норма зафиксирована' : 'Требует внимания'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="hidden sm:flex flex-col items-end">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Пропуски мониторинга</p>
                      <div className="flex gap-1">
                        {est.facilitySkipDays?.length > 0 ? (
                          est.facilitySkipDays.slice(0, 5).map((d: any) => (
                            <span key={d} className="w-5 h-5 flex items-center justify-center bg-rose-50 text-rose-600 rounded-md text-[8px] font-black">{d}</span>
                          ))
                        ) : (
                          <span className="text-[9px] font-black text-emerald-500 uppercase italic">Нарушений нет</span>
                        )}
                        {est.facilitySkipDays?.length > 5 && <span className="text-[8px] font-black text-slate-300">...</span>}
                      </div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                     <ArrowRight size={18} />
                   </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white border border-slate-100 border-dashed rounded-[2rem] p-20 text-center">
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Заведения не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}