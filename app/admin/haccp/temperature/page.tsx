"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpDown,
  MapPin,
  User,
  Thermometer
} from "lucide-react";
import { useSession } from "next-auth/react";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function AdminHACCPTemperatureListPage({ searchParams: searchParamsPromise }: any) {
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
      // Фетчим данные через админский эндпоинт (type=temperature)
      const res = await fetch(`/api/admin/haccp/summary?month=${currentMonth}&year=${currentYear}&type=temperature`, {
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
        case 'name': aValue = a.name.toLowerCase(); bValue = b.name.toLowerCase(); break;
        case 'city': aValue = a.city.toLowerCase(); bValue = b.city.toLowerCase(); break;
        case 'partner': aValue = (a.partner || "").toLowerCase(); bValue = (b.partner || "").toLowerCase(); break;
        case 'skips': aValue = a.facilitySkipDays?.length || 0; bValue = b.facilitySkipDays?.length || 0; break;
        default: return 0;
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [establishments, searchQuery, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getDaysAddition = (count: number) => {
    const lastDigit = count % 10;
    if (count > 10 && count < 20) return 'пропусков';
    if (lastDigit === 1) return 'пропуск';
    if (lastDigit >= 2 && lastDigit <= 4) return 'пропуска';
    return 'пропусков';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="animate-spin text-[#10b981]" size={32} />
      <div className="text-[10px] tracking-[0.3em] font-bold uppercase text-gray-400">Загрузка данных температуры...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between gap-6 py-4 bg-[#F3F4F6]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/admin/haccp" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-[#111827] tracking-tight">Температурные режимы</h1>
            <p className="text-sm text-gray-500 font-medium">Мониторинг холодильного оборудования</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              placeholder="Поиск заведения..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#10b981] transition-all shadow-soft"
            />
          </div>

          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-soft">
            <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-2 hover:text-[#10b981] transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <div className="px-4 min-w-[150px] text-center text-[11px] font-bold uppercase tracking-widest text-[#111827]">
              {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-2 hover:text-[#10b981] transition-colors">
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* TABLE HEADERS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_200px_150px] px-8 gap-4">
        <button onClick={() => requestSort('name')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#10b981] transition-colors">
          Заведение <ArrowUpDown size={12} />
        </button>
        <button onClick={() => requestSort('city')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#10b981] transition-colors">
          Локация <ArrowUpDown size={12} />
        </button>
        <button onClick={() => requestSort('partner')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#10b981] transition-colors">
          Партнер <ArrowUpDown size={12} />
        </button>
        <button onClick={() => requestSort('skips')} className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#10b981] transition-colors">
          Пропуски <ArrowUpDown size={12} />
        </button>
      </div>

      {/* LIST CONTENT */}
      <div className="flex flex-col gap-3">
        {processedEst.map((est: any) => {
          const skipsCount = est.facilitySkipDays?.length || 0;
          return (
            <Link 
              key={est.id} 
              href={`/partner/office/establishments/${est.id}/temperature`}
              className="group grid grid-cols-1 lg:grid-cols-[1fr_200px_200px_150px] items-center gap-4 p-5 px-8 bg-white rounded-[2rem] border border-transparent shadow-soft hover:shadow-xl hover:border-[#10b981]/30 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-5 min-w-0">
                <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl border transition-all
                  ${est.isFilledToday 
                    ? "bg-[#ecfdf5] border-[#d1fae5] text-[#10b981]" 
                    : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                  {est.isFilledToday ? <Thermometer size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[15px] font-bold text-[#111827] truncate group-hover:text-[#10b981] transition-colors">
                    {est.name}
                  </h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${est.isFilledToday ? 'text-[#10b981]' : 'text-rose-500'}`}>
                    {est.isFilledToday ? 'Все замеры внесены' : 'Есть пропуски сегодня'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-[11px] font-bold uppercase tracking-tight truncate">{est.city}</span>
                </div>
                <span className="text-[10px] text-gray-400 truncate mt-0.5">{est.address || "—"}</span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <User size={12} className="text-gray-400" />
                  <span className="text-[11px] font-bold uppercase tracking-tight truncate">{est.partner || "Система"}</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Владелец</span>
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-[14px] font-bold leading-tight ${skipsCount > 0 ? "text-rose-500" : "text-[#10b981]"}`}>
                  {skipsCount > 0 ? `${skipsCount} ${getDaysAddition(skipsCount)}` : 'Без замечаний'}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">За месяц</span>
              </div>
            </Link>
          );
        })}

        {processedEst.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Результатов не найдено</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-12 flex justify-between items-center px-4 opacity-60">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Unit One Ecosystem v.2.4</p>
        <div className="flex gap-4 items-center">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#10b981]">Admin Temp Monitor</span>
        </div>
      </footer>
    </div>
  );
}