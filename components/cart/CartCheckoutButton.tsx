"use client";

import { useState, useEffect } from "react";
import { createOrderFromCart } from "@/app/actions/orders";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export default function CartCheckoutButton({ totalAmount }: { totalAmount: number }) {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false); 
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePay = async () => {
    if (totalAmount <= 0 || !agreed) return;

    setLoading(true);
    
    try {
      // 1. Создаем заказ в базе данных через серверный экшен
      const res = await createOrderFromCart();

      // Проверяем успех и наличие orderId (productId удален, так как его нет в возвращаемом типе)
      if (res.success && res.orderId) {
        // 2. Запрашиваем реальную ссылку на оплату у нашего API
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            orderId: res.orderId 
          }),
        });

        const data = await response.json();

        if (data.url) {
          // 3. Перенаправляем пользователя на сайт ЮKassa
          window.location.href = data.url;
        } else {
          alert(`Ошибка платежной системы: ${data.error || 'не удалось получить ссылку'}`);
        }
      } else {
        alert(`Ошибка оформления: ${res.error || 'неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error("PAYMENT_ERROR:", error);
      alert("Произошла ошибка при соединении с сервером платежей");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div className="w-full h-16 bg-white/5 animate-pulse rounded-[24px]" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div 
        className="flex items-start gap-3 px-2 cursor-pointer group" 
        onClick={() => setAgreed(!agreed)}
      >
        <div className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
          agreed ? 'bg-indigo-500 border-indigo-500' : 'bg-white/10 border-white/20 group-hover:border-white/40'
        }`}>
          {agreed && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        
        <p className="text-[10px] font-bold text-white/50 leading-tight uppercase tracking-wider select-none">
          Я согласен с условиями{" "}
          <Link 
            href="/terms" 
            onClick={(e) => e.stopPropagation()} 
            className="text-white underline decoration-indigo-500/50 hover:text-indigo-400 transition-colors"
          >
            Публичной оферты
          </Link>
          {" "}и{" "}
          <Link 
            href="/policy" 
            onClick={(e) => e.stopPropagation()} 
            className="text-white underline decoration-indigo-500/50 hover:text-indigo-400 transition-colors"
          >
            Политикой конфиденциальности
          </Link>
        </p>
      </div>

      <button
        onClick={handlePay}
        disabled={loading || totalAmount === 0 || !agreed}
        className={`w-full h-16 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl ${
          agreed && !loading
            ? "bg-white text-[#1e1b4b] hover:scale-[1.02] active:scale-95 shadow-white/10"
            : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5 shadow-none"
        }`}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-[#1e1b4b]/30 border-t-[#1e1b4b] rounded-full animate-spin"/>
        ) : (
          <>
            <Lock size={14} className={agreed ? "text-indigo-500" : "text-white/20"} />
            <span>Оплатить {totalAmount.toLocaleString('ru-RU')} ₽</span>
          </>
        )}
      </button>

      <div className="flex flex-col items-center gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-6 opacity-30 grayscale contrast-200">
           <span className="text-[10px] font-black tracking-tighter">VISA</span>
           <span className="text-[10px] font-black tracking-tighter">MASTERCARD</span>
           <span className="text-[10px] font-black tracking-tighter">МИР</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
          <ShieldCheck size={10} />
          <span>Secure Cloud Payments SSL 256-bit</span>
        </div>
      </div>
    </div>
  );
}