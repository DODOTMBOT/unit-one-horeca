"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Компонент карточки
const StatCard = ({ title, value, subtext }: { title: string, value: string | number, subtext: string }) => (
  <div className="flex flex-col rounded-3xl bg-[#f5f5f5] p-8">
    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">{title}</p>
    <h3 className="text-4xl font-black text-black">{value}</h3>
    <p className="mt-2 text-xs text-neutral-500">{subtext}</p>
  </div>
);

export default function UsersStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Используем async/await для надежности
    const getStats = async () => {
      try {
        const res = await fetch('/api/admin/stats/users', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Ошибка загрузки статистики:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center font-bold animate-pulse text-neutral-400">ПОЛУЧЕНИЕ ДАННЫХ...</div>
      </div>
    );
  }

  // Состояние ошибки
  if (error || !stats) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <p className="text-red-500 font-bold mb-4">ОШИБКА ПРИ ЗАГРУЗКЕ СТАТИСТИКИ</p>
        <Link href="/admin/statistics" className="text-sm underline text-neutral-500 hover:text-black">
          Попробовать снова
        </Link>
      </div>
    );
  }

  const COLORS = ['#000000', '#e5e5e5'];

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/statistics" className="text-sm text-neutral-400 hover:text-black transition">
          ← Назад к статистике
        </Link>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight mb-10">Аналитика аудитории</h1>

        {/* Сетка показателей */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            title="Пользователи" 
            value={stats.totalUsers || 0} 
            subtext="Всего регистраций" 
          />
          <StatCard 
            title="Админы" 
            value={stats.totalAdmins || 0} 
            subtext="Доступ к панели" 
          />
          <StatCard 
            title="Соцсети" 
            value={stats.withSocials || 0} 
            subtext="TG / VK заполнено" 
          />
          <StatCard 
            title="Телефоны" 
            value={stats.withPhone || 0} 
            subtext="Связь установлена" 
          />
        </div>

        {/* Секция с графиком */}
        <div className="rounded-3xl bg-[#f5f5f5] p-8 flex flex-col md:flex-row items-center gap-8 border border-neutral-100">
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-bold mb-4">Качество профилей</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Соотношение пользователей с указанным номером телефона к общему числу зарегистрированных.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                <div className="h-3 w-3 rounded-full bg-black"></div> 
                <span>Заполнено ({Math.round((stats.withPhone / stats.totalUsers) * 100) || 0}%)</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-neutral-400">
                <div className="h-3 w-3 rounded-full bg-neutral-300"></div> 
                <span>Не указано</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.chartData.map((_: any, index: number) => (
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
      </div>
    </div>
  );
}