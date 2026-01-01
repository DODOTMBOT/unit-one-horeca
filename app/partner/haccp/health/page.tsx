"use client";

import { useState, useEffect, use } from "react";
// Добавлен импорт Loader2
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  LogOut, 
  Search, 
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminHACCPHealthListPage({ searchParams: searchParamsPromise }: any) {
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
        // Используем эндпоинт админки для получения всех заведений системы
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
        <header className="flex items-center justify-between mb-12">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/admin/settings" 
              className="group flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] hidden lg:block">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#1e1b4b] leading-none text-center">
              Контроль здоровья: Все точки
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-3">
            <Link 
              href="/admin" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:border-[#7171a7] flex items-center gap-3"
            >
              <Home size={16} className="text-slate-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none">Панель</p>
            </Link>
            <Link 
              href="/" 
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
              title="Выйти"
            >
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    placeholder="ПОИСК ПО НАЗВАНИЮ, ГОРОДУ ИЛИ УЛИЦЕ..." 
                    className="pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#7171a7] w-full sm:w-[450px] transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-[1.5rem] border border-slate-100">
                <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-3 transition-colors hover:text-[#7171a7] text-slate-400">
                    <ChevronLeft size={20} />
                </Link>
                <div className="px-8 min-w-[200px] text-center font-black uppercase text-[10px] tracking-[0.2em] text-[#1e1b4b]">
                    {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </div>
                <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-3 transition-colors hover:text-[#7171a7] text-slate-400">
                    <ChevronRight size={20} />
                </Link>
            </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-slate-300" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Загрузка базы данных...</p>
          </div>
        ) : filteredEst.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 border-slate-100">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Точки не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredEst.map((est) => {
              const skipsCount = est.facilitySkipDays?.length || 0;
              
              return (
                <Link 
                  key={est.id} 
                  href={`/partner/office/establishments/${est.id}/health`}
                  className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 transition-all duration-300 flex flex-col justify-between h-[320px] hover:border-[#7171a7]"
                >
                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${est.isFilledToday ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {est.isFilledToday ? 'OK' : 'MISSING'}
                      </div>
                      {est.partner && (
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          {est.partner.name}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-[15px] font-black uppercase tracking-tight text-[#1e1b4b] mb-2 leading-tight line-clamp-2 group-hover:text-[#7171a7] transition-colors">
                      {est.name}
                    </h3>
                    
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {est.city}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">
                        {est.address}
                        </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-slate-50/50 px-5 py-4 rounded-[1.5rem] border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">
                        Пропуски ({displayDate.toLocaleString('ru-RU', { month: 'short' })})
                      </p>
                      <p className={`text-[11px] font-black leading-none ${skipsCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {skipsCount > 0 ? `${skipsCount} ${getDaysAddition(skipsCount)}` : 'Журнал чист'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-24 pt-10 border-t border-slate-100 flex justify-between items-center opacity-40">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Unit One Ecosystem v.2.4</p>
           <div className="flex gap-4 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Admin Live View</span>
          </div>
        </div>
      </div>
    </div>
  );
}