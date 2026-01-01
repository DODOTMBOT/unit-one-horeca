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
  ChevronDown, 
  ChevronLeft,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle
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
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-[#111827] tracking-tight">Заказы</h1>
            <p className="text-sm text-gray-500 font-medium">Процессинг входящих заявок</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-xl shadow-soft">
           <ShoppingBag size={18} className="text-[#10b981]" />
           <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{filteredOrders.length} операций</span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap items-center gap-2 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
              filter === tab.id 
              ? 'bg-[#10b981] text-white border-[#10b981] shadow-lg shadow-emerald-500/20' 
              : 'bg-white text-gray-400 border-gray-200 hover:border-[#10b981] hover:text-[#10b981]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20 bg-white rounded-[2.5rem] shadow-soft border border-gray-100">
            <Loader2 className="animate-spin text-[#10b981]" size={32} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-[2.5rem]">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Заказов не найдено</p>
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
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  key={order.id} 
                  className="group rounded-[2.5rem] border border-transparent bg-white p-6 shadow-soft transition-all duration-300 hover:border-[#10b981]/30 hover:shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* USER INFO */}
                    <div className="flex items-center gap-5 min-w-0">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${order.status === 'completed' ? 'bg-gray-50 text-gray-300' : 'bg-[#ecfdf5] text-[#10b981]'}`}>
                        <User size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-[#111827] truncate">
                          {order.user?.email || order.userEmail}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                        </span>
                      </div>
                    </div>

                    {/* BADGES & DATA TOGGLE */}
                    <div className="flex flex-wrap items-center gap-3">
                      {hasAnswers && (
                        <button 
                          onClick={() => toggleOrder(order.id)} 
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isExpanded ? 'bg-[#10b981] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                        >
                          Данные клиента {isExpanded ? <ChevronDown size={14} className="rotate-180" /> : <ChevronDown size={14} />}
                        </button>
                      )}
                      
                      <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                        order.status === 'new' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                        'bg-emerald-50 text-emerald-500 border-emerald-100'
                      }`}>
                        {order.status === 'new' && <AlertCircle size={12} />}
                        {order.status === 'processing' && <Clock size={12} />}
                        {order.status === 'completed' && <CheckCircle2 size={12} />}
                        {order.status === 'new' ? 'Новый' : order.status === 'processing' ? 'В работе' : 'Готово'}
                      </div>
                    </div>

                    {/* AMOUNT & ACTIONS */}
                    <div className="flex items-center gap-8 lg:border-l lg:pl-8 border-gray-100">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Сумма</span>
                        <span className="text-xl font-bold text-[#111827] tracking-tight">{order.amount.toLocaleString()} ₽</span>
                      </div>

                      <div className="w-[140px]">
                        {order.status === 'completed' ? (
                          <div className="w-full text-center py-3 rounded-xl text-[10px] font-bold uppercase bg-gray-50 text-gray-300 border border-gray-100">Архив</div>
                        ) : (
                          <button 
                            onClick={() => updateOrderStatus(order.id, order.status === 'processing' ? 'completed' : 'processing')}
                            className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase transition-all shadow-lg ${
                              order.status === 'processing' 
                              ? 'bg-[#10b981] text-white hover:bg-[#059669] shadow-emerald-500/20' 
                              : 'bg-[#1F2937] text-white hover:bg-black'
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
                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.items.map((item: any) => 
                            item.answers && Object.entries(item.answers).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <div className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mb-1.5">{item.product.requirements?.[key]?.title || "Поле данных"}</div>
                                <div className="text-xs font-medium text-[#111827] leading-relaxed break-words">{String(value)}</div>
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
    </div>
  );
}