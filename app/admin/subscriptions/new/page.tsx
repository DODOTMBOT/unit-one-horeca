"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, X, LayoutGrid, Palette, BadgePercent, ShieldCheck } from "lucide-react";
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

const lightInput = "bg-slate-50 border-slate-200 text-[#1e1b4b] placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 rounded-3xl";
const darkInput = "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 focus:ring-0 rounded-3xl";

export default function NewSubscriptionPlan() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    badgeText: "",
    priceMonth: 0,
    price3Month: 0,
    price6Month: 0,
    priceYear: 0,
    order: 0,
    canAccessMarketplace: true,
    hasPrioritySupport: false,
  });

  const [features, setFeatures] = useState<string[]>([""]);

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) => {
    if (features.length > 1) setFeatures(features.filter((_, i) => i !== index));
  };
  
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: features.filter(f => f.trim() !== ""),
        }),
      });
      if (res.ok) {
        router.push("/admin/subscriptions");
        router.refresh();
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-20">
      <form onSubmit={handleSubmit} className="mx-auto max-w-[1400px] px-6 pt-10">
        
        {/* СТИЛЬНЫЙ ХЕДЕР */}
        <header className="sticky top-6 z-40 mb-10 flex h-20 items-center justify-between rounded-full border border-slate-200 bg-white/90 px-8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-6">
            <Link href="/admin/subscriptions" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm hover:scale-110 transition-all">
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-indigo-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Новый тариф</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Настройка подписки</p>
            </div>
          </div>
          <Button 
            type="submit" 
            isLoading={loading}
            className="rounded-full bg-[#1e1b4b] px-10 py-3 text-[11px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 transition-all shadow-xl"
          >
            Сохранить тариф
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          <div className="lg:col-span-8 space-y-8">
            {/* СЕКЦИЯ 1: Основное */}
            <section className="rounded-[45px] border border-white bg-white p-10 shadow-xl">
              <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-6">
                <LayoutGrid className="text-indigo-500" size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#1e1b4b]">Конфигурация тарифа</h2>
              </div>
              
              <div className="space-y-8">
                <Input 
                  label="Название плана" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Напр: NanoDose"
                  className={lightInput}
                />

                <Textarea 
                  label="Описание" 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Суть данного предложения..."
                  className={lightInput}
                />

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Преимущества</label>
                  {features.map((f, i) => (
                    <div key={i} className="flex gap-3 group animate-in fade-in duration-300">
                      <input 
                        value={f}
                        onChange={(e) => updateFeature(i, e.target.value)}
                        className={`flex-1 ${lightInput} px-6 py-3 rounded-2xl h-12`}
                        placeholder="Что включено?"
                      />
                      <button 
                        type="button" 
                        onClick={() => removeFeature(i)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addFeature}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 pt-2"
                  >
                    <Plus size={16} /> Добавить строку
                  </button>
                </div>
              </div>
            </section>

            {/* СЕКЦИЯ 2: Цены */}
            <section className="rounded-[45px] border border-white bg-white p-10 shadow-xl">
              <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-6">
                <BadgePercent className="text-indigo-500" size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#1e1b4b]">Ценообразование</h2>
              </div>
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {[
                  { id: 'priceMonth', label: 'Месяц' },
                  { id: 'price3Month', label: '3 месяца' },
                  { id: 'price6Month', label: '6 месяцев' },
                  { id: 'priceYear', label: 'Год' }
                ].map((p) => (
                  <div key={p.id}>
                    <Input 
                      label={p.label}
                      type="number"
                      value={formData[p.id as keyof typeof formData] as number}
                      onChange={(e) => setFormData({...formData, [p.id]: Number(e.target.value)})}
                      className={`${lightInput} font-bold text-indigo-600`}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="lg:col-span-4 space-y-8">
            <section className="rounded-[45px] border border-[#1e1b4b] bg-[#1e1b4b] p-10 shadow-2xl text-white">
              <div className="mb-8 flex items-center gap-3">
                <ShieldCheck className="text-indigo-400" size={20} />
                <h2 className="text-xs font-black uppercase tracking-widest">Доступы и визуал</h2>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Настройки доступа</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                      <span className="text-[11px] font-bold uppercase">Маркетплейс</span>
                      <input 
                        type="checkbox" 
                        checked={formData.canAccessMarketplace}
                        onChange={(e) => setFormData({...formData, canAccessMarketplace: e.target.checked})}
                        className="h-5 w-5 accent-indigo-500"
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                      <span className="text-[11px] font-bold uppercase">Приоритет саппорт</span>
                      <input 
                        type="checkbox" 
                        checked={formData.hasPrioritySupport}
                        onChange={(e) => setFormData({...formData, hasPrioritySupport: e.target.checked})}
                        className="h-5 w-5 accent-indigo-500"
                      />
                    </label>
                  </div>
                </div>

                <Input 
                  label="Бейдж тарифа" 
                  value={formData.badgeText}
                  onChange={(e) => setFormData({...formData, badgeText: e.target.value})}
                  placeholder="NEW, HIT" 
                  className={darkInput} 
                />
                
                <Input 
                  label="Сортировка (ID)" 
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                  placeholder="0" 
                  className={darkInput} 
                />
              </div>
            </section>
          </div>

        </div>
      </form>
    </div>
  );
}