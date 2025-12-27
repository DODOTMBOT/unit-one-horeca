"use client";

import { signIn } from "next-auth/react";
import Script from "next/script";
import { useEffect, useRef } from "react";

export default function SignInPage() {
  const tgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Настройка виджета Telegram
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "u_nit_one_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "20");
    script.setAttribute("data-auth-url", "https://unit-one.ru/api/auth/callback/telegram");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (tgContainerRef.current) {
      tgContainerRef.current.innerHTML = "";
      tgContainerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6] p-4 text-center">
      <Script src="https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-styles.js" />
      <div className="w-full max-w-[400px] bg-white rounded-[48px] p-10 py-14 shadow-sm flex flex-col items-center">
        <h1 className="text-[26px] font-bold mb-10">Выберите способ входа</h1>
        
        {/* Кнопка Яндекса */}
        <button
          onClick={() => signIn("yandex", { callbackUrl: "/" })}
          className="w-full py-4 rounded-full bg-black text-white font-bold mb-8 shadow-lg active:scale-95 transition-all"
        >
          Войти с Яндекс ID
        </button>

        <div ref={tgContainerRef} className="w-full flex justify-center min-h-[40px]" />
      </div>
    </div>
  );
}