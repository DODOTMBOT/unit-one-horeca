"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const StatCard = ({ title, value, subtext }: { title: string, value: string | number, subtext: string }) => (
  <div className="flex flex-col rounded-3xl bg-[#f5f5f5] p-8 transition-all">
    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">{title}</p>
    <h3 className="text-4xl font-black text-black">{value}</h3>
    <p className="mt-2 text-sm text-neutral-500">{subtext}</p>
  </div>
);

export default function ProductsStatsPage() {
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ count: 0, avg: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats/products');
        const resData = await res.json();
        
        if (resData.products) {
          setData(resData.products);
          setTotals({
            count: resData.count,
            avg: resData.avgPrice
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const COLORS = ['#000000', '#737373', '#a3a3a3', '#d4d4d4'];

  if (loading) return <div className="p-20 text-center font-bold">Загрузка аналитики...</div>;

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/statistics" className="text-sm text-neutral-400 hover:text-black transition">
          ← Назад к статистике
        </Link>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight mb-10">Аналитика продуктов</h1>

        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          <StatCard 
            title="Всего товаров" 
            value={totals.count} 
            subtext="Активные позиции в каталоге" 
          />
          <StatCard 
            title="Средняя цена" 
            value={`${Math.round(totals.avg).toLocaleString()} ₽`} 
            subtext="Средняя стоимость одного решения" 
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Круговая диаграмма - Доля цен */}
          <div className="lg:col-span-1 rounded-3xl border border-neutral-100 p-8 flex flex-col items-center">
            <h3 className="text-lg font-bold mb-6 self-start">Ценовые доли</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="price"
                    nameKey="title"
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Гистограмма - Сравнение */}
          <div className="lg:col-span-2 rounded-3xl bg-[#f5f5f5] p-8">
            <h3 className="text-lg font-bold mb-6">Сравнение цен по позициям</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis 
                    dataKey="title" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700}} 
                  />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="price" fill="#000" radius={[10, 10, 10, 10]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}