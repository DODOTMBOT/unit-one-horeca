"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductProps {
  id: string;
  title: string;
  price: number;
  type: string;
}

export default function CheckoutForm({ product }: { product: ProductProps }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, email: email }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Ошибка: Не получена ссылка на оплату");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Что-то пошло не так.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
      
      {/* ЗАГОЛОВОК */}
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1e1b4b]">Оформление</h2>
        <div className="w-2.5 h-2.5 rounded-full bg-[#a78bfa] animate-pulse" />
      </div>

      {/* КАРТОЧКА ПРОДУКТА */}
      <div className="bg-[#f8f7ff] p-8 rounded-[32px] border border-purple-50">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a78bfa] block mb-2">
              Выбранный продукт
            </span>
            <h3 className="text-lg font-black text-[#1e1b4b] leading-tight pr-4">
              {product.title}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a78bfa] block mb-2 text-right">
              К оплате
            </span>
            <span className="text-2xl font-black text-[#1e1b4b] tracking-tighter">
              {product.price.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
      </div>

      {/* ВВОД EMAIL */}
      <div className="space-y-3">
        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#1e1b4b] ml-1">
          Email для получения доступа
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-16 px-6 bg-[#f8f7ff] border border-transparent rounded-[20px] text-sm font-bold focus:bg-white focus:border-[#a78bfa] outline-none transition-all placeholder:text-slate-300 text-[#1e1b4b]"
          required
        />
      </div>

      {/* КНОПКА ОПЛАТЫ */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1e1b4b] hover:bg-[#2d2a5d] text-white h-16 rounded-[22px] font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-70"
      >
        {loading ? (
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
        ) : (
          <>
            <span>Подтвердить оплату</span>
            <span className="opacity-40">•</span>
            <span>{product.price.toLocaleString('ru-RU')} ₽</span>
          </>
        )}
      </button>
      
      <div className="flex items-center justify-center gap-2 opacity-30 group">
        <div className="w-4 h-4 bg-slate-400 rounded-sm" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          Secure SSL Payment System
        </p>
      </div>

    </form>
  );
}