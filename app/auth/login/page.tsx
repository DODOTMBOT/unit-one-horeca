"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const success = searchParams.get("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      login: formData.login,
      password: formData.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Неверный логин или пароль");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
        
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-[#1e1b4b] mb-2">Вход в систему</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit One Ecosystem</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase text-emerald-700">Регистрация успешна! Войдите</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Логин или Email</label>
            <input 
              required
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-[#1e1b4b] outline-none focus:ring-2 ring-indigo-500/20" 
              value={formData.login}
              onChange={e => setFormData({...formData, login: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Пароль</label>
            <input 
              required
              type="password"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-[#1e1b4b] outline-none focus:ring-2 ring-indigo-500/20" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 justify-center text-red-500">
              <AlertCircle size={14} />
              <p className="text-[10px] font-black uppercase">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1e1b4b] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>Войти в систему <ArrowRight size={14} /></>
            )}
          </button>

          <p className="text-[9px] font-bold text-slate-400 text-center pt-4 uppercase">
            Нет аккаунта?{" "}
            {/* ИЗМЕНЕНО: Используем обычный href для принудительного перехода без сохранения callbackUrl */}
            <a href="/auth/register" className="text-indigo-500">Зарегистрироваться</a>
          </p>
        </form>
      </div>
    </div>
  );
}