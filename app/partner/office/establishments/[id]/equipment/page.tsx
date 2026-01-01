"use client";

import { useState, useEffect, use } from "react";
import { 
  ArrowLeft, Loader2, Monitor, Cpu, 
  Thermometer, Plus, Settings2, ShieldCheck 
} from "lucide-react";
import Link from "next/link";

export default function EstablishmentEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedData = async () => {
      try {
        // Мы используем тот же API, который уже расширили (он возвращает массив equipment)
        const res = await fetch(`/api/establishments/${id}`);
        const result = await res.json();
        setEstablishment(result);
      } catch (err) {
        console.error("Ошибка загрузки оборудования:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetailedData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <Loader2 className="animate-spin text-slate-300" size={24} />
    </div>
  );

  const equipment = establishment?.equipment || [];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#1e1b4b]">
      <div className="max-w-[800px] mx-auto px-6 py-12">
        
        {/* Хлебные крошки */}
        <Link 
          href={`/partner/establishments/${id}`} 
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all mb-10 group"
        >
          <ArrowLeft size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Назад в дашборд</span>
        </Link>

        {/* Заголовок */}
        <header className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Технический парк</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Оборудование</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase mt-2">{establishment?.name}</p>
          </div>
          
          <Link 
            href="/partner/equipment" 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm"
          >
            <Plus size={12} />
            Управление парком
          </Link>
        </header>

        {/* Список оборудования */}
        <div className="grid grid-cols-1 gap-4">
          {equipment.length === 0 ? (
            <div className="py-20 bg-white border border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center px-10">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                <Monitor size={24} />
              </div>
              <h3 className="text-xs font-black uppercase text-slate-400">Приборы не найдены</h3>
              <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Добавьте первый холодильник или печь через "Управление парком"</p>
            </div>
          ) : (
            equipment.map((item: any) => (
              <div 
                key={item.id}
                className="group bg-white border border-slate-100 p-6 rounded-[28px] hover:shadow-xl hover:shadow-indigo-900/5 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Monitor size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase">
                        <Cpu size={10} />
                        {item.type || 'Не указан'}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                        <ShieldCheck size={10} />
                        Исправен
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-right">
                    <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Лимит</p>
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-700">
                      <Thermometer size={10} className="text-rose-500" />
                      {item.minTemp}° / {item.maxTemp}°
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                    <Settings2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}