"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    login: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleType: "partner", // partner или employee
    inviteCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);

    try {
      // Перед отправкой, если это партнер, очищаем инвайт-код на всякий случай
      const payload = {
        ...formData,
        inviteCode: formData.roleType === 'partner' ? "" : formData.inviteCode
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка регистрации");
      }

      router.push("/auth/login?success=1");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[500px] bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
        
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-[#1e1b4b] mb-2">Создать аккаунт</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Присоединяйтесь к экосистеме Unit One</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, roleType: 'partner'})}
              className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.roleType === 'partner' ? "bg-[#1e1b4b] text-white shadow-lg" : "text-slate-400"}`}
            >
              Владелец
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, roleType: 'employee'})}
              className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.roleType === 'employee' ? "bg-[#1e1b4b] text-white shadow-lg" : "text-slate-400"}`}
            >
              Сотрудник
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Имя</label>
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-[#1e1b4b] outline-none focus:ring-2 ring-indigo-500/20" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Фамилия</label>
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-[#1e1b4b] outline-none focus:ring-2 ring-indigo-500/20" 
                value={formData.surname}
                onChange={e => setFormData({...formData, surname: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Логин</label>
            <input 
              required
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-[#1e1b4b] outline-none focus:ring-2 ring-indigo-500/20" 
              value={formData.login}
              onChange={e => setFormData({...formData, login: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Email</label>
            <input 
              required
              type="email"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-[#1e1b4b] outline-none focus:ring-2 ring-indigo-500/20" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {formData.roleType === 'employee' && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] font-black uppercase text-indigo-500 ml-4">Код заведения (7 знаков)</label>
              <input 
                required
                placeholder="Напр: ABC1234"
                maxLength={7}
                className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl px-5 py-3.5 text-xs font-black text-[#1e1b4b] outline-none placeholder:text-indigo-200" 
                value={formData.inviteCode}
                onChange={e => setFormData({...formData, inviteCode: e.target.value.toUpperCase()})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
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
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Повтор</label>
              <input 
                required
                type="password"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-[#1e1b4b] outline-none focus:ring-2 ring-indigo-500/20" 
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          {error && <p className="text-[10px] font-black uppercase text-red-500 text-center pt-2">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1e1b4b] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>Создать аккаунт <ArrowRight size={14} /></>
            )}
          </button>

          <p className="text-[9px] font-bold text-slate-400 text-center pt-4 uppercase">
            Уже есть аккаунт? <Link href="/auth/login" className="text-indigo-500">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}