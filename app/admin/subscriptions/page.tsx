"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Settings2, Trash2, Edit3 } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonth: number;
  features: string[];
  badgeText?: string;
}

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/subscription-plans');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки планов:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-[1200px] px-6 pt-10">
        
        {/* ХЕДЕР В ЕДИНОМ СТИЛЕ */}
        <header className="sticky top-6 z-40 mb-12 flex h-20 items-center justify-between rounded-full border border-white bg-white/70 px-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin" 
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm hover:scale-110 transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-indigo-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Подписки</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Управление тарифами</p>
            </div>
          </div>
          
          <Link href="/admin/subscriptions/new">
            <button className="flex items-center gap-2 rounded-full bg-[#1e1b4b] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 transition-all shadow-xl">
              <Plus size={14} /> Добавить тариф
            </button>
          </Link>
        </header>

        {/* СЕТКА ТАРИФОВ */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div 
                key={plan.id} 
                className="group relative flex flex-col rounded-[45px] border border-white bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                {plan.badgeText && (
                  <div className="absolute right-8 top-8 rounded-full bg-indigo-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                    {plan.badgeText}
                  </div>
                )}

                <div className="relative mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
                    {plan.name}
                  </h2>
                  <div className="mt-2 h-1.5 w-12 rounded-full bg-indigo-500 transition-all group-hover:w-20" />
                </div>

                <div className="mb-8">
                  <span className="text-3xl font-black text-[#1e1b4b]">{plan.priceMonth.toLocaleString()} ₽</span>
                  <span className="ml-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest">/ месяц</span>
                </div>

                <div className="mb-10 flex-grow">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Включено:</p>
                  <ul className="space-y-3">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[11px] font-bold uppercase text-slate-500">
                        <div className="h-1 w-1 rounded-full bg-indigo-400" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-50">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-50 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600">
                    <Edit3 size={14} /> Правка
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-[45px] border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Тарифы еще не созданы</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}