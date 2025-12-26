"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react"; // Используем иконку для стиля

export default function ProfileAlert() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status !== "authenticated" || !session) return null;

  const user = session.user as any;

  // ЛОГИКА: Скрываем (return null), если выполнены условия:
  // Есть Телефон И (есть VK ИЛИ есть Telegram)
  const isProfileComplete = Boolean(user.phone) && (Boolean(user.vk) || Boolean(user.telegram));

  if (isProfileComplete) return null;

  return (
    <div className="w-full mb-10 animate-fade-in">
      <div className="flex w-full items-center gap-6 rounded-[40px] border border-slate-100 bg-white p-6 shadow-sm md:p-8 group hover:shadow-md transition-all duration-500 relative overflow-hidden">
        
        {/* Иконка в лавандовом стиле */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-slate-50 text-[#1e1b4b] group-hover:scale-110 transition-transform duration-500">
          <Lightbulb size={28} strokeWidth={1.5} />
        </div>

        {/* Текст: Ink 900 и Slate 400 */}
        <div className="flex-1">
          <h3 className="text-[16px] font-black uppercase tracking-tight text-[#1e1b4b]">
            Заполните ваш профиль
          </h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight mt-1">
            Чтобы получить доступ к материалам и скидкам
          </p>
        </div>

        {/* Кнопка: Чернильный стиль */}
        <Link
          href="/profile"
          className="shrink-0 rounded-full bg-[#1e1b4b] px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#a78bfa] active:scale-95 shadow-xl shadow-indigo-100 relative z-10"
        >
          Перейти
        </Link>

        {/* Декоративный фон при наведении */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#f3f0ff] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </div>
    </div>
  );
}