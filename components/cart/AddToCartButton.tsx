"use client";

import { useState } from "react";
import { addToCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, X } from "lucide-react"; 

interface Requirement {
  title: string;
  details: string;
}

export default function AddToCartButton({ 
  productId, 
  price, 
  requirements = [] 
}: { 
  productId: string, 
  price: number,
  requirements?: Requirement[] 
}) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const isAllAnswered = requirements.length === 0 || 
    requirements.every((_, idx) => answers[idx]?.trim().length > 0);

  const handleAction = async () => {
    setLoading(true);
    const res = await addToCart(productId, answers);
    setLoading(false);

    if (res?.error) {
      router.push("/api/auth/signin"); 
    } else {
      setAdded(true);
      setShowModal(false);
      router.refresh();
    }
  };

  if (added) {
    return (
      <button 
        onClick={() => router.push("/cart")} 
        className="w-full bg-[#f3f0ff] text-[#a78bfa] h-14 rounded-[20px] font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 transition-all hover:bg-[#ece7ff]"
      >
        <Check size={16} strokeWidth={3} /> <span>В корзине (Перейти)</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => requirements.length > 0 ? setShowModal(true) : handleAction()}
        disabled={loading}
        className="w-full bg-[#1e1b4b] hover:bg-[#2d2a5d] text-white h-14 rounded-[20px] font-black uppercase tracking-[0.15em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:scale-[1.01] active:scale-[0.98]"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
        ) : (
          <>
            <ShoppingCart size={16} strokeWidth={2.5} />
            <span>В корзину — {price.toLocaleString('ru-RU')} ₽</span>
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1e1b4b]/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative border border-slate-50">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute right-8 top-8 text-slate-300 hover:text-[#1e1b4b] transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            
            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#1e1b4b] mb-3">
              Уточнение данных
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 leading-relaxed">
              Пожалуйста, заполните поля ниже для корректной обработки вашего заказа
            </p>
            
            <div className="space-y-8 mb-10 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#1e1b4b] ml-1">
                    {req.title}
                  </label>
                  <input 
                    type="text"
                    placeholder={req.details}
                    className="w-full h-14 bg-[#f8f7ff] border border-transparent rounded-[18px] px-5 text-sm outline-none focus:border-[#a78bfa] focus:bg-white transition-all text-[#1e1b4b] placeholder:text-slate-300"
                    value={answers[idx] || ""}
                    onChange={(e) => setAnswers({...answers, [idx]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleAction}
              disabled={!isAllAnswered || loading}
              className={`w-full h-14 rounded-[20px] font-black uppercase tracking-[0.15em] text-[10px] transition-all ${
                isAllAnswered 
                ? "bg-[#a78bfa] text-white shadow-lg shadow-purple-100 hover:bg-[#8b5cf6]" 
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Обработка..." : "Подтвердить и добавить"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}