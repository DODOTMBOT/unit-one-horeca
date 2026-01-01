"use client";

import { useState, useEffect, use, useMemo, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Импортируем роутер для навигации по клику
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Users,
  ChevronDown
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminHACCPHealthListPage({ searchParams: searchParamsPromise }: any) {
  const { data: session } = useSession() as any;
  const params = use(searchParamsPromise) as any;
  const router = useRouter(); // Инициализация роутера
  
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
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/haccp/summary?month=${currentMonth}&year=${currentYear}&type=health`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setEstablishments(data);
          const initialExpanded: Record<string, boolean> = {};
          data.forEach((est: any) => { initialExpanded[est.partner || "Система"] = true; });
          setExpandedGroups(initialExpanded);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    if (session) fetchSummary(); 
  }, [currentMonth, currentYear, session]);

  const groupedEst = useMemo(() => {
    const filtered = establishments.filter(est => 
      est.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      est.partner?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const groups: Record<string, any[]> = {};
    filtered.forEach(est => {
      const p = est.partner || "Система";
      if (!groups[p]) groups[p] = [];
      groups[p].push(est);
    });
    return Object.keys(groups).sort().map(partner => ({
      partner,
      items: groups[partner].sort((a, b) => a.name.localeCompare(b.name))
    }));
  }, [establishments, searchQuery]);

  const toggleGroup = (partner: string) => {
    setExpandedGroups(prev => ({ ...prev, [partner]: !prev[partner] }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="animate-spin text-[#10b981]" size={40} />
      <div className="text-xs tracking-[0.2em] font-bold uppercase text-gray-400">Синхронизация данных...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto px-4">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/admin/haccp" className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">Мониторинг здоровья</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider">Сводный реестр HACCP</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="Поиск объектов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#10b981] w-64 lg:w-80 transition-all shadow-sm focus:ring-4 ring-[#10b981]/5"
            />
          </div>

          <div className="flex items-center bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
            <Link href={`?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#10b981]"><ChevronLeft size={20} /></Link>
            <div className="px-4 min-w-[140px] text-center text-xs font-black uppercase tracking-widest text-gray-800">
              {displayDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <Link href={`?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#10b981]"><ChevronRight size={20} /></Link>
          </div>
        </div>
      </header>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Объект / Локация</th>
              <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Статус сегодня</th>
              <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Пропуски (мес)</th>
            </tr>
          </thead>
          <tbody>
            {groupedEst.map((group, gIdx) => {
              const isExpanded = expandedGroups[group.partner] !== false;
              return (
                <Fragment key={group.partner}>
                  {/* Группировка по партнеру */}
                  <tr 
                    onClick={() => toggleGroup(group.partner)}
                    className={`cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 border-b border-gray-100 ${gIdx !== 0 ? 'border-t-2 border-gray-100' : ''}`}
                  >
                    <td colSpan={3} className="px-8 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
                          <Users size={18} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">{group.partner}</span>
                          <span className="text-[11px] bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-400 font-bold ml-1">
                            {group.items.length}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Строки заведений */}
                  {isExpanded && group.items.map((est) => (
                    <tr 
                      key={est.id} 
                      onClick={() => router.push(`/partner/office/establishments/${est.id}/health`)}
                      className="group cursor-pointer hover:bg-emerald-50/20 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <td className="px-10 py-5">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-bold text-gray-800 group-hover:text-[#10b981] transition-colors">{est.name}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-medium">
                            <MapPin size={14} className="text-gray-300" />
                            <span>{est.city}, {est.address || "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          {est.isFilledToday ? (
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wide border border-emerald-100">
                              <CheckCircle2 size={14} /> OK
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-50 text-rose-500 text-xs font-bold uppercase tracking-wide border border-rose-100">
                              <AlertCircle size={14} /> Пропуск
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-sm font-black ${est.facilitySkipDays?.length > 0 ? "text-rose-500" : "text-gray-300"}`}>
                          {est.facilitySkipDays?.length || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {groupedEst.length === 0 && (
          <div className="py-32 text-center text-gray-300 text-sm uppercase font-bold tracking-[0.3em]">
            Ничего не найдено
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="flex justify-between items-center px-4 mt-4 opacity-50">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Unit One Ecosystem v.2.4</p>
        <div className="flex gap-4 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#10b981]">Live Monitoring</span>
        </div>
      </footer>
    </div>
  );
}