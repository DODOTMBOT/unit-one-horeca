"use client";

import { useState, useEffect } from "react";
import { getAdminOrders } from "@/app/actions/admin";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSWRConfig } from "swr"; 
import { 
  User, 
  Package, 
  CheckCircle, 
  FileEdit, 
  ChevronDown, 
  LayoutGrid,
  PlayCircle,
  ChevronLeft,
  ShoppingBag
} from "lucide-react";

// Типы для фронтенда
type OrderStatus = 'new' | 'processing' | 'completed';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'materials' | 'requirements' | 'processing' | 'completed'>('all');
  
  const { mutate } = useSWRConfig(); 

  // Загрузка заказов и приведение статусов к единому виду
  const fetchOrders = async () => {
    try {
      const data = await getAdminOrders();
      const enrichedData = data.map((order: any) => {
        let currentStatus: OrderStatus = 'new';
        
        // Строгое соответствие Enum из БД
        if (order.status === 'PROCESSING') currentStatus = 'processing';
        else if (order.status === 'COMPLETED') currentStatus = 'completed';
        else currentStatus = 'new'; // Сюда упадут NEW, PAID, PENDING
        
        return { ...order, status: currentStatus };
      });
      setOrders(enrichedData);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, nextStep: OrderStatus) => {
    try {
      // 1. Оптимистичное обновление (для скорости интерфейса)
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: nextStep } : order
      ));

      // 2. Сопоставление для БД (статус должен быть в UPPERCASE для Prisma Enum)
      const dbStatus = nextStep === 'completed' ? 'COMPLETED' : 'PROCESSING';

      // 3. Запрос к API
      const response = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          status: dbStatus 
        })
      });

      if (!response.ok) throw new Error("Status update failed");

      // 4. СИНХРОНИЗАЦИЯ: Обновляем бейдж в хедере по ключу API
      await mutate("/api/admin/orders/count");
      
      // 5. Перестраховка: обновляем локальные данные из БД
      fetchOrders();

    } catch (error) {
      console.error("Update error:", error);
      fetchOrders(); // Откат изменений при ошибке
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const filteredOrders = orders.filter(order => {
    const hasMaterials = order.items.some((i: any) => i.product.materials?.length > 0);
    const hasAnswers = order.items.some((i: any) => i.answers && Object.keys(i.answers).length > 0);
    if (filter === 'all') return true; 
    if (filter === 'completed') return order.status === 'completed';
    if (filter === 'processing') return order.status === 'processing';
    if (filter === 'materials') return hasMaterials; 
    if (filter === 'requirements') return hasAnswers;
    return true;
  });

  const tabs = [
    { id: 'all', label: 'Все', icon: LayoutGrid, color: 'bg-[#1e1b4b]' },
    { id: 'materials', label: 'Вложения', icon: Package, color: 'bg-emerald-500' },
    { id: 'requirements', label: 'Данные', icon: FileEdit, color: 'bg-orange-500' },
    { id: 'processing', label: 'В работе', icon: PlayCircle, color: 'bg-indigo-500' },
    { id: 'completed', label: 'Завершены', icon: CheckCircle, color: 'bg-slate-400' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-10 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 pt-6">
        
        <header className="sticky top-4 z-40 mb-6 flex h-16 items-center justify-between rounded-3xl border border-slate-200 bg-white/90 px-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-100 hover:scale-110 transition-all">
              <ChevronLeft size={16} className="text-slate-600" />
            </Link>
            <h1 className="text-sm font-black uppercase tracking-tighter text-[#1e1b4b]">Заказы</h1>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <ShoppingBag size={12} className="text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{filteredOrders.length} операций</span>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === tab.id ? 'text-white shadow-md' : 'text-slate-400 bg-white border border-slate-100'
              }`}
            >
              <div className="relative z-10 flex items-center gap-1.5">
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </div>
              {filter === tab.id && (
                <motion.div layoutId="active-pill" className={`absolute inset-0 ${tab.color} rounded-2xl z-0`} transition={{ type: "spring", bounce: 0.1, duration: 0.4 }} />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order: any) => {
              const hasAnswers = order.items.some((i: any) => i.answers && Object.keys(i.answers).length > 0);
              const isExpanded = expandedOrders[order.id];
              const userId = order.userId || order.user?.id;

              return (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={order.id} className="group rounded-[24px] border border-white bg-white/70 p-3 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md">
                  <div className="grid grid-cols-[1fr_auto_280px] items-center gap-4 px-2">
                    <div className="min-w-0">
                      <Link href={`/admin/users/${userId}`} className="inline-flex items-center gap-3 group/user hover:opacity-70 transition-opacity max-w-full">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${order.status === 'completed' ? 'bg-slate-100 text-slate-400' : 'bg-[#1e1b4b] text-white shadow-sm'}`}>
                          <User size={18} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[13px] text-[#1e1b4b] break-all leading-tight border-b border-transparent group-hover/user:border-indigo-200 transition-colors">
                            {order.user?.email || order.userEmail}
                          </span>
                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-0.5 opacity-60">
                            {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                          </span>
                        </div>
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5 px-2">
                      {hasAnswers && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleOrder(order.id); }} className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-orange-100 transition-colors">
                          <FileEdit size={10} /> ДАННЫЕ <ChevronDown size={10} className={isExpanded ? 'rotate-180 transition-transform' : ''} />
                        </button>
                      )}
                      
                      {/* СТАТУСЫ ДЛЯ АДМИНА */}
                      {order.status === 'new' && (
                        <div className="bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase border border-red-100">
                          НОВЫЙ
                        </div>
                      )}
                      {order.status === 'processing' && (
                        <div className="flex items-center gap-1.5 bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase">
                          <PlayCircle size={10} className="animate-pulse" /> РАБОТА
                        </div>
                      )}
                      {order.status === 'completed' && (
                        <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase">
                          <CheckCircle size={10} /> ГОТОВО
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-6 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 h-full">
                      <div className="text-right shrink-0">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter block leading-none mb-1">Сумма</span>
                        <div className="text-[16px] font-black text-[#1e1b4b] tracking-tighter leading-none">{order.amount.toLocaleString()} ₽</div>
                      </div>

                      <div className="w-[140px] shrink-0">
                        {order.status === 'completed' ? (
                          <div className="w-full text-center py-2 rounded-xl text-[8px] font-black uppercase bg-slate-50 text-slate-400 border border-slate-100 opacity-60">АРХИВ</div>
                        ) : (
                          <button 
                            onClick={() => updateOrderStatus(order.id, order.status === 'processing' ? 'completed' : 'processing')}
                            className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all shadow-sm active:scale-95 ${
                              order.status === 'processing' 
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                              : 'bg-[#1e1b4b] text-white hover:bg-indigo-600'
                            }`}
                          >
                            {order.status === 'processing' ? 'ЗАВЕРШИТЬ' : 'В РАБОТУ'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {order.items.map((item: any) => 
                            item.answers && Object.entries(item.answers).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                <div className="text-[7px] font-black text-indigo-400 uppercase tracking-tighter mb-1">{item.product.requirements?.[key]?.title || "Поле"}</div>
                                <div className="text-[10px] font-bold text-[#1e1b4b] leading-tight break-words">{String(value)}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}