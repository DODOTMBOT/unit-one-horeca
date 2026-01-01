"use client";

import { useState, useEffect, use } from "react";
import { 
  ChevronLeft, ChevronRight, Home, LogOut, Search, ArrowLeft 
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
        const res = await fetch(
          `/api/partner/haccp/summary?month=${currentMonth}&year=${currentYear}&type=temperature&t=${Date.now()}`, 
          { cache: 'no-store' }
        );
        
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
    est.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysAddition = (count: number) => {
    const lastDigit = count % 10;
    if (count > 10 && count < 20) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12 pb-20">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER BAR */}
        <header className="flex items-center justify-between mb-20">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/partner/haccp" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 flex items-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Журналы HACCP</p>
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:block shadow-sm">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Выбор заведения: Температуры
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-2">
            <Link 
              href="/partner" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 shadow-sm flex items-center gap-3"
            >
              <Home size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Главная</p>
            </Link>
            <Link 
              href="/" 
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors shadow-sm"
              title="Выйти"
            >
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    placeholder="ПОИСК ПО НАЗВАНИЮ, ГОРОДУ ИЛИ УЛИЦЕ..." 
                    className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500/10 w-full sm:w-[420px] transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-3 transition-opacity hover:opacity-60 text-slate-400">
                    <ChevronLeft size={20} />
                </Link>
                <div className="px-6 min-w-[160px] text-center font-black uppercase text-[11px] tracking-[0.15em] text-slate-800">
                    {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </div>
                <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-3 transition-opacity hover:opacity-60 text-slate-400">
                    <ChevronRight size={20} />
                </Link>
            </div>
        </div>

        {/* ESTABLISHMENTS GRID */}
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Синхронизация...</p>
          </div>
        ) : filteredEst.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2rem] border-dashed border-2 border-slate-100">
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Заведения не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredEst.map((est) => {
              const skipDays = est.facilitySkipDays || [];
              const skipsCount = skipDays.length;
              const hasSkips = skipsCount > 0;
              
              return (
                <Link 
                  key={est.id} 
                  href={`/partner/office/establishments/${est.id}/temperature`}
                  className="group bg-white p-8 rounded-[2rem] border border-slate-100 transition-colors duration-300 flex flex-col justify-between h-[300px] hover:border-indigo-200"
                >
                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${!hasSkips ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {!hasSkips ? 'ЗАПОЛНЕНО' : 'ПРОПУСК'}
                      </div>
                    </div>
                    
                    <h3 className="text-[16px] font-black uppercase tracking-tight text-[#1e1b4b] mb-1 leading-tight line-clamp-2">
                      {est.name}
                    </h3>
                    
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {est.city}
                        </p>
                        <p className="text-[9px] font-medium text-slate-300 uppercase tracking-wider line-clamp-1">
                        {est.address}
                        </p>
                    </div>
                  </div>

                  <div className="mt-auto relative">
                    <div className="group/tooltip relative">
                      
                      <div className="bg-slate-50 px-5 py-4 rounded-[1.8rem] border border-slate-100 transition-colors hover:border-rose-100 cursor-help">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">
                          Пропущенные дни
                        </p>
                        <p className={`text-[12px] font-black leading-none ${hasSkips ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {hasSkips ? `${skipsCount} ${getDaysAddition(skipsCount)}` : 'Чисто'}
                        </p>
                      </div>

                      {hasSkips && (
                        <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[220px] p-4 bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl rounded-[1.5rem] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible translate-y-2 group-hover/tooltip:translate-y-0 transition-all duration-300 z-50 pointer-events-none text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2 text-[#1e1b4b]">
                            Даты пропусков
                          </p>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {skipDays.map((d: any) => (
                              <span key={d} className="w-7 h-7 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black border border-rose-100/30">
                                {d}
                              </span>
                            ))}
                          </div>
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45"></div>
                        </div>
                      )}

                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-32 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="opacity-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Unit One Ecosystem v.2.4</p>
          </div>
        </div>
      </div>
    </div>
  );
}