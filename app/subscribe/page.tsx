"use client";
import { useState, useEffect } from "react";

// Интерфейс для TypeScript, чтобы он понимал структуру плана
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  badgeText: string;
  features: string[];
  priceMonth: number;
  price3Month: number;
  price6Month: number;
  priceYear: number;
}

const periods = [
  { label: '1 мес', key: 'priceMonth' },
  { label: '3 мес', key: 'price3Month' },
  { label: '6 мес', key: 'price6Month' },
  { label: '1 год', key: 'priceYear' }
];

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<keyof SubscriptionPlan>('priceMonth');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // 1. Загружаем планы из базы при загрузке страницы
  useEffect(() => {
    fetch('/api/admin/subscription-plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      })
      .catch(err => console.error("Ошибка загрузки планов:", err));
  }, []);

  // 2. Функция вызова оплаты
  const handleSubscribe = async (planId: string) => {
    setSubmitting(planId);
    try {
      const res = await fetch("/api/subscribe", { 
        method: "POST",
        body: JSON.stringify({ planId }) // Передаем ID выбранного плана
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Уходим на ЮKassa
      } else {
        alert(data.error || "Ошибка при переходе к оплате");
      }
    } catch (err) {
      alert("Ошибка связи с сервером");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest">Loading plans...</div>;

  return (
    <div className="py-20 px-4 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter text-slate-900">Transparent pricing</h2>
          
          {/* Переключатель периодов */}
          <div className="inline-flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key as keyof SubscriptionPlan)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedPeriod === p.key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Сетка тарифов */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={plan.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {String(index + 1).padStart(2, '0')} {plan.name}
                </span>
                {plan.badgeText && (
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {plan.badgeText}
                  </span>
                )}
              </div>
              
              <h3 className="text-3xl font-black mb-2 italic text-slate-900">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-6 min-h-[40px]">{plan.description}</p>
              
              <button 
                onClick={() => handleSubscribe(plan.id)}
                disabled={submitting !== null}
                className="w-full border-2 border-indigo-600 text-indigo-600 h-14 rounded-full font-bold mb-8 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
              >
                {submitting === plan.id ? "Processing..." : "Get me dose"}
              </button>

              <div className="mt-auto">
                <div className="text-3xl font-black mb-6 text-slate-900">
                  {plan[selectedPeriod] as number} ₽ 
                  <span className="text-sm font-normal text-slate-400">
                    {selectedPeriod === 'priceYear' ? '/year' : '/mo'}
                  </span>
                </div>
                
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-center gap-3">
                      <span className="text-indigo-500 font-bold">✔</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}