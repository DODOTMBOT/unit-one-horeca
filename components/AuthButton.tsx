"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  // Если пользователь уже вошел
  if (session && session.user) {
    return (
      <div className="flex items-center gap-4">
        {/* Аватарка или имя */}
        {session.user.image && (
          <img 
            src={session.user.image} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full" 
          />
        )}
        <span className="font-bold text-sm hidden md:block">
          {session.user.name || "Пользователь"}
        </span>
        
        <button
          onClick={() => signOut()}
          className="text-xs text-red-500 hover:text-red-700 transition"
        >
          Выйти
        </button>
      </div>
    );
  }

  // Если пользователь НЕ вошел (показываем кнопки)
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => signIn("vk")}
        className="bg-[#0077FF] hover:bg-[#0066DD] text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-200"
      >
        VK ID
      </button>
      
      <button
        onClick={() => signIn("yandex")}
        className="bg-[#FC3F1D] hover:bg-[#E63515] text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-red-200"
      >
        Яндекс
      </button>
    </div>
  );
}