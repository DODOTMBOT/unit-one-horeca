"use client";

import { useState, useEffect } from "react";
import { 
  Store, ChevronRight, 
  Loader2, ShieldCheck, ArrowLeft 
} from "lucide-react";
import Link from "next/link";

export default function ManagerHACCP() {
  // Всегда инициализируем как пустой массив
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const res = await fetch("/api/manager/establishments");
        const data = await res.json();

        // Проверяем, что данные являются массивом
        if (Array.isArray(data)) {
          setEstablishments(data);
        } else {
          console.error("API вернул ошибку или не массив:", data);
          setEstablishments([]); 
        }
      } catch (err) {
        console.error("Ошибка при запросе заведений:", err);
        setEstablishments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishments();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#1e1b4b]">
      <div className="max-w-[900px] mx-auto px-6 py-16">
        
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Система ХАССП</p>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Рабочее место управляющего</h1>
          <p className="text-xs font-bold text-slate-400 uppercase">Выберите объект для заполнения журналов</p>
        </header>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Безопасный вызов map через проверку Array.isArray */}
            {Array.isArray(establishments) && establishments.length > 0 ? (
              establishments.map((est) => (
                <Link 
                  key={est.id}
                  href={`/manager/haccp/health/${est.id}`}
                  className="group flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[32px] hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                      <Store size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                        {est.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {est.city}, {est.address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                     <div className="hidden sm:block text-right">
                        <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Доступно персонала</p>
                        <p className="text-xs font-black">{est._count?.employees || 0} чел.</p>
                     </div>
                     <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all">
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600" />
                     </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-20 bg-white border border-dashed border-slate-200 rounded-[40px] text-center">
                <ShieldCheck size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-10">
                  У вас нет привязанных заведений для управления или доступ ограничен
                </p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-16 flex justify-between items-center text-slate-300">
          <Link href="/manager" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Назад в хаб</span>
          </Link>
          <p className="text-[9px] font-black uppercase tracking-widest">HACCP Terminal v1.0</p>
        </footer>
      </div>
    </div>
  );
}