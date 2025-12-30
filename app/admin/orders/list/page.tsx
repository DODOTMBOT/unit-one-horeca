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
  ShoppingBag,
  Loader2
} from "lucide-react";

type OrderStatus = 'new' | 'processing' | 'completed';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'materials' | 'requirements' | 'processing' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { mutate } = useSWRConfig(); 

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminOrders();
      const enrichedData = data.map((order: any) => {
        let currentStatus: OrderStatus = 'new';
        if (order.status === 'PROCESSING') currentStatus = 'processing';
        else if (order.status === 'COMPLETED') currentStatus = 'completed';
        else currentStatus = 'new';
        return { ...order, status: currentStatus };
      });
      setOrders(enrichedData);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, nextStep: OrderStatus) => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: nextStep } : order
      ));
      const dbStatus = nextStep === 'completed' ? 'COMPLETED' : 'PROCESSING';
      const response = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: dbStatus })
      });
      if (!response.ok) throw new Error("Status update failed");
      await mutate("/api/admin/orders/count");
      fetchOrders();
    } catch (error) {
      fetchOrders();
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
    { id: 'all', label: 'Все' },
    { id: 'materials', label: 'Вложения' },
    { id: 'requirements', label: 'Данные' },
    { id: 'processing', label: 'В работе' },
    { id: 'completed', label: 'Завершены' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/admin" 
              className="group flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Управление заказами
            </h1>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
               <ShoppingBag size={14} className="text-[#7171a7]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{filteredOrders.length} операций</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-8 py-3.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all border ${
                filter === tab.id 
                ? 'bg-[#1e1b4b] text-white border-[#1e1b4b]' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-[#7171a7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-slate-200" size={32} />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Заказов не найдено</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order: any) => {
                const hasAnswers = order.items.some((i: any) => i.answers && Object.keys(i.answers).length > 0);
                const isExpanded = expandedOrders[order.id];
                const userId = order.userId || order.user?.id;

                return (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    key={order.id} 
                    className="group rounded-[2rem] border border-slate-100 bg-white p-6 transition-all duration-300 hover:border-[#7171a7]"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* USER INFO */}
                      <div className="flex items-center gap-5 min-w-0">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${order.status === 'completed' ? 'bg-slate-50 text-slate-300' : 'bg-slate-50 text-[#1e1b4b]'}`}>
                          <User size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link href={`/admin/users/${userId}`} className="text-[13px] font-black uppercase tracking-tight text-[#1e1b4b] hover:text-[#7171a7] transition-colors truncate">
                            {order.user?.email || order.userEmail}
                          </Link>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                            {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                          </span>
                        </div>
                      </div>

                      {/* BADGES & DATA TOGGLE */}
                      <div className="flex flex-wrap items-center gap-3">
                        {hasAnswers && (
                          <button 
                            onClick={() => toggleOrder(order.id)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-[#7171a7] text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            Данные клиента {isExpanded ? <ChevronDown size={12} className="rotate-180" /> : <ChevronDown size={12} />}
                          </button>
                        )}
                        
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          order.status === 'new' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                          order.status === 'processing' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' :
                          'bg-emerald-50 text-emerald-500 border-emerald-100'
                        }`}>
                          {order.status === 'new' ? 'Новый' : order.status === 'processing' ? 'В работе' : 'Готово'}
                        </div>
                      </div>

                      {/* AMOUNT & ACTIONS */}
                      <div className="flex items-center gap-8 lg:border-l lg:pl-8 border-slate-50">
                        <div className="text-right">
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Сумма</span>
                          <span className="text-lg font-black text-[#1e1b4b] tracking-tighter">{order.amount.toLocaleString()} ₽</span>
                        </div>

                        <div className="w-[140px]">
                          {order.status === 'completed' ? (
                            <div className="w-full text-center py-3.5 rounded-xl text-[9px] font-black uppercase bg-slate-50 text-slate-300 border border-slate-100">Архив</div>
                          ) : (
                            <button 
                              onClick={() => updateOrderStatus(order.id, order.status === 'processing' ? 'completed' : 'processing')}
                              className={`w-full py-3.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                                order.status === 'processing' 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                : 'bg-[#1e1b4b] text-white hover:bg-[#7171a7]'
                              }`}
                            >
                              {order.status === 'processing' ? 'Завершить' : 'В работу'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED DATA */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {order.items.map((item: any) => 
                              item.answers && Object.entries(item.answers).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-slate-50/50 p-4 rounded-[1.2rem] border border-slate-100">
                                  <div className="text-[8px] font-black text-[#7171a7] uppercase tracking-widest mb-2">{item.product.requirements?.[key]?.title || "Поле"}</div>
                                  <div className="text-[11px] font-bold text-[#1e1b4b] leading-relaxed break-words">{String(value)}</div>
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
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-50 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-200">
          <p>Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-emerald-500/50 tracking-widest">Процессинг активен</span>
          </div>
        </div>
      </div>
    </div>
  );
}