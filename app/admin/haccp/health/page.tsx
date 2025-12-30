"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpDown
} from "lucide-react";
import { useSession } from "next-auth/react";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function AdminHACCPHealthListPage({ searchParams: searchParamsPromise }: any) {
  const { data: session } = useSession() as any;
  const params = use(searchParamsPromise) as any;
  
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const currentMonth = params.month ? parseInt(params.month) : new Date().getMonth();
  const currentYear = params.year ? parseInt(params.year) : new Date().getFullYear();

  const displayDate = new Date(currentYear, currentMonth, 1);
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const nextDate = new Date(currentYear, currentMonth + 1, 1);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/haccp/summary?month=${currentMonth}&year=${currentYear}&type=health`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setEstablishments(data);
      }
    } catch (e) { 
      console.error("Ошибка загрузки", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (session) fetchSummary(); 
  }, [currentMonth, currentYear, session]);

  const processedEst = useMemo(() => {
    let filtered = establishments.filter(est => 
      est.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      est.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.partner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'city':
          aValue = a.city.toLowerCase();
          bValue = b.city.toLowerCase();
          break;
        case 'partner':
          aValue = (a.partner || "").toLowerCase();
          bValue = (b.partner || "").toLowerCase();
          break;
        case 'skips':
          aValue = a.facilitySkipDays?.length || 0;
          bValue = b.facilitySkipDays?.length || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [establishments, searchQuery, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getDaysAddition = (count: number) => {
    const lastDigit = count % 10;
    if (count > 10 && count < 20) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F3F6] gap-4">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
      <div className="text-[10px] tracking-[0.3em] font-black uppercase text-indigo-400">Синхронизация HACCP...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-10 font-sans text-[#1e1b4b]">
      <div className="mx-auto max-w-[1400px] px-4 pt-6">
        
        <header className="sticky top-4 z-40 mb-6 flex h-16 items-center justify-between rounded-3xl border border-slate-200 bg-white/90 px-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/admin/haccp" className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-100 hover:scale-110 transition-all">
              <ChevronLeft size={16} className="text-slate-600" />
            </Link>
            <h1 className="text-sm font-black uppercase tracking-tighter">Мониторинг здоровья</h1>
          </div>

          <div className="relative flex-1 max-w-md mx-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Поиск по заведению, адресу, партнеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-100">
            <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-2 transition-opacity hover:opacity-60 text-slate-400">
              <ChevronLeft size={16} />
            </Link>
            <div className="px-4 min-w-[140px] text-center font-black uppercase text-[9px] tracking-widest">
              {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-2 transition-opacity hover:opacity-60 text-slate-400">
              <ChevronRight size={16} />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px_220px_180px] px-8 mb-2 gap-4">
          <button onClick={() => requestSort('name')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            Заведение <ArrowUpDown size={10} />
          </button>
          <button onClick={() => requestSort('city')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            Локация <ArrowUpDown size={10} />
          </button>
          <button onClick={() => requestSort('partner')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            Партнер <ArrowUpDown size={10} />
          </button>
          <button onClick={() => requestSort('skips')} className="flex items-center justify-end gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors pr-4">
            Пропуски <ArrowUpDown size={10} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {processedEst.map((est: any) => {
            const skipsCount = est.facilitySkipDays?.length || 0;

            return (
              <Link 
                key={est.id} 
                href={`/partner/establishments/${est.id}/health`}
                className="group grid grid-cols-1 lg:grid-cols-[1fr_250px_220px_180px] items-center gap-4 p-4 px-6 rounded-2xl border border-white bg-white/70 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all
                    ${est.isFilledToday 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-500" 
                      : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                    {est.isFilledToday ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[13px] font-black uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors leading-tight">
                      {est.name}
                    </h4>
                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${est.isFilledToday ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {est.isFilledToday ? 'Заполнено сегодня' : 'Пропущено сегодня'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-tighter truncate text-slate-700 leading-tight">
                    {est.city}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 truncate tracking-tight">
                    {est.address || "—"}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-tighter truncate text-slate-700 leading-tight">
                    {est.partner || "Система"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Владелец</span>
                </div>

                <div className="flex flex-col items-end pr-4">
                  <span className={`text-[12px] font-black uppercase tracking-tighter leading-tight ${skipsCount > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                    {skipsCount > 0 ? `${skipsCount} ${getDaysAddition(skipsCount)}` : 'Чисто'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">За месяц</span>
                </div>
              </Link>
            );
          })}

          {processedEst.length === 0 && (
            <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-slate-200 bg-white/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Результатов не найдено</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-between items-center opacity-40 px-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Admin Live View</span>
          </div>
        </div>
      </div>
    </div>
  );
}