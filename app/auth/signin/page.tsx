"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export default function SignInPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const tgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "u_nit_one_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "20");
    script.setAttribute("data-auth-url", "/api/auth/callback/telegram");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (tgContainerRef.current) {
      tgContainerRef.current.innerHTML = "";
      tgContainerRef.current.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      login,
      password,
      callbackUrl: "/",
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6] p-4 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[48px] p-10 py-14 shadow-sm flex flex-col items-center">
        <h1 className="text-[26px] font-bold mb-10 text-[#1e1b4b]">Вход в систему</h1>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4 mb-8">
          <input
            type="text"
            placeholder="Логин или Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            required
          />
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-[#1e1b4b] text-white font-bold shadow-lg active:scale-95 transition-all mt-4"
          >
            Войти
          </button>
        </form>

        <div className="w-full flex items-center gap-4 mb-8 opacity-20">
          <div className="h-[1px] bg-black flex-1"></div>
          <span className="text-[10px] font-bold uppercase">или</span>
          <div className="h-[1px] bg-black flex-1"></div>
        </div>

        <div ref={tgContainerRef} className="w-full flex justify-center min-h-[40px]" />
      </div>
    </div>
  );
}