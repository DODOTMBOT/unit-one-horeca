"use client";

import React from "react";
import Link from "next/link";
import { Package, Download, Clock, CheckCircle2, FileText, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function PurchasesList({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-100">
        <Package className="mx-auto text-slate-200 mb-4" size={40} />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">У вас пока нет покупок</p>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5">
            {order.items?.map((item: any) => {
              const materials = item.product?.materials || [];
              const hasMaterials = materials.length > 0;
              const isCompleted = order.status === 'COMPLETED' || order.status === 'completed';

              return (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b last:border-0 border-slate-50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}>
                      {hasMaterials ? <Package size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <h3 className="font-black text-[13px] text-slate-900 uppercase tracking-tight">{item.product?.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                          <Clock size={10} /> {format(new Date(order.createdAt), "d MMMM yyyy", { locale: ru })}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-black text-slate-900 uppercase">{formatPrice(order.amount)} ₽</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCompleted && (
                      <div className="px-3 py-1.5 bg-green-50 rounded-lg text-[9px] font-black uppercase text-green-600 border border-green-100 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Заказ готов
                      </div>
                    )}
                    {hasMaterials && (
                      <Link href={`/order/success?orderId=${order.id}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase">
                        <Download size={14} /> Материалы
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}