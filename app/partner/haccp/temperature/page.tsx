"use client";

import { useState, useEffect, use, useMemo, Fragment } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  AlertCircle,
  Loader2,
  MapPin,
  ChevronDown,
  Thermometer,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PartnerHACCPTemperatureListPage({ searchParams: searchParamsPromise }: any) {
  const { data: session } = useSession() as any;
  const params = use(searchParamsPromise) as any;
  const router = useRouter();
  
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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
          
          // Раскрываем все города по умолчанию
          const initialExpanded: Record<string, boolean> = {};
          data.forEach((est: any) => {
            const city = est.city?.toUpperCase() || "ДРУГИЕ ГОРОДА";
            initialExpanded[city] = true;
          });
          setExpandedGroups(initialExpanded);
        }
      } catch (e) { 
        console.error("Ошибка загрузки:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    if (session) load();
  }, [currentMonth, currentYear, session]);

  // Группировка по городам
  const groupedData = useMemo(() => {
    const filtered = establishments.filter(est => 
      est.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      est.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: Record<string, any[]> = {};
    filtered.forEach(est => {
      const city = est.city?.toUpperCase() || "ДРУГИЕ ГОРОДА";
      if (!groups[city]) groups[city] = [];
      groups[city].push(est);
    });

    return Object.keys(groups).sort().map(city => ({
      city,
      items: groups[city].sort((a, b) => a.name.localeCompare(b.name))
    }));
  }, [establishments, searchQuery]);

  const toggleGroup = (city: string) => {
    setExpandedGroups(prev => ({ ...prev, [city]: !prev[city] }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 uppercase">
      <Loader2 className="animate-spin text-[#10b981]" size={40} />
      <div className="text-[10px] tracking-[0.2em] font-black text-gray-400">Синхронизация данных...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-[1400px] mx-auto px-4 uppercase">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none uppercase">Температурные режимы</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 tracking-wider">Мониторинг оборудования по городам</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="ПОИСК ОБЪЕКТА..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#10b981] w-64 lg:w-80 transition-all shadow-sm focus:ring-4 ring-[#10b981]/5 uppercase"
            />
          </div>

          <div className="flex items-center bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
            <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#10b981]">
              <ChevronLeft size={20} />
            </Link>
            <div className="px-4 min-w-[140px] text-center text-[10px] font-black tracking-widest text-gray-800">
              {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#10b981]">
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Объект / Адрес</th>
              <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Статус оборудования</th>
              <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Пропуски</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.map((group, gIdx) => {
              const isExpanded = expandedGroups[group.city] !== false;
              return (
                <Fragment key={group.city}>
                  {/* Заголовок города */}
                  <tr 
                    onClick={() => toggleGroup(group.city)}
                    className={`cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 border-b border-gray-100 ${gIdx !== 0 ? 'border-t border-gray-100' : ''}`}
                  >
                    <td colSpan={3} className="px-8 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
                          <MapPin size={18} className="text-[#10b981]" />
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">{group.city}</span>
                          <span className="text-[11px] bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-400 font-bold ml-1">
                            {group.items.length}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Список заведений */}
                  {isExpanded && group.items.map((est) => {
                    const skipDays = est.facilitySkipDays || [];
                    const hasSkips = skipDays.length > 0;

                    return (
                      <tr 
                        key={est.id} 
                        className="group transition-colors border-b border-gray-50 last:border-0"
                      >
                        <td className="px-10 py-5">
                          <Link href={`/partner/office/establishments/${est.id}/temperature`} className="flex flex-col group">
                            <span className="text-[15px] font-bold text-gray-800 group-hover:text-[#10b981] transition-colors uppercase">{est.name}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-medium italic lowercase">
                              <span>{est.address || "адрес не указан"}</span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            {!hasSkips ? (
                              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase">
                                <Thermometer size={14} /> Норма
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-50 text-rose-500 text-[10px] font-black border border-rose-100 uppercase">
                                <AlertCircle size={14} /> Пропуск
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`text-sm font-black ${hasSkips ? "text-rose-500" : "text-gray-300"}`}>
                            {skipDays.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {groupedData.length === 0 && (
          <div className="py-32 text-center text-gray-300 text-[11px] uppercase font-bold tracking-[0.3em]">
            Объекты не найдены
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="flex justify-between items-center px-4 mt-8 opacity-40">
        <div className="flex items-center gap-3">
          <LayoutGrid size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 uppercase">Unit One Ecosystem v.2.4</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#10b981] uppercase">Temp Monitor</span>
        </div>
      </footer>
    </div>
  );
}