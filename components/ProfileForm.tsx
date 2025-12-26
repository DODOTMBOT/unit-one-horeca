'use client';

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { updateProfile } from "@/app/actions/profile";

export default function ProfileForm({ user, email }: { user: any, email: string }) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setShowSuccess(false);

    try {
      const result = await updateProfile(formData);
      if (result?.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      }
    } catch (error) {
      alert("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {showSuccess && (
        <div className="fixed top-24 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400">
            <span>✅</span>
            <span className="font-bold">Изменения сохранены в базе!</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl rounded-3xl border border-neutral-100 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-4xl text-neutral-400">
            👤
          </div>
          <h1 className="text-2xl font-bold text-black">Мой профиль</h1>
          <p className="text-neutral-500">{email}</p>
        </div>

        <form action={handleSubmit} className="mb-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-neutral-700">Номер телефона</label>
              <input 
                name="phone" 
                defaultValue={user?.phone || ''} 
                placeholder="+7 (999) 000-00-00" 
                className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-neutral-700">Telegram / VK (ссылка)</label>
              <input 
                name="socialLink" 
                defaultValue={user?.socialLink || ''} 
                placeholder="@username" 
                className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-neutral-700">Название заведения</label>
              <input 
                name="restaurantName" 
                defaultValue={user?.restaurantName || ''} 
                placeholder="Название" 
                className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-neutral-700">Формат</label>
              <select 
                name="restaurantFormat" 
                defaultValue={user?.restaurantFormat || ''} 
                className="w-full rounded-xl border border-neutral-200 p-3 bg-white outline-none focus:border-black"
              >
                <option value="">Выберите формат</option>
                <option value="Ресторан">Ресторан</option>
                <option value="Кафе">Кафе</option>
                <option value="Пиццерия">Пиццерия</option>
                <option value="Бургерная">Бургерная</option>
                <option value="Фастфуд">Фастфуд</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold text-neutral-700">Адрес</label>
              <input 
                name="restaurantAddress" 
                defaultValue={user?.restaurantAddress || ''} 
                placeholder="Город, улица, дом" 
                className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-neutral-700">Дата рождения</label>
              <input 
                type="date" 
                name="birthDate" 
                defaultValue={user?.birthDate || ''} 
                className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className={`w-full rounded-xl py-4 font-bold text-white transition-all ${isSaving ? 'bg-neutral-400' : 'bg-black hover:bg-neutral-800'}`}
          >
            {isSaving ? "Сохранение..." : "Сохранить данные"}
          </button>
        </form>

        <div className="space-y-3 border-t border-neutral-100 pt-6">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center justify-center rounded-xl bg-red-50 py-3 font-bold text-red-600 hover:bg-red-100 transition-colors"
          >
            Выйти из аккаунта
          </button>
          <div className="text-center">
            <Link href="/" className="mt-4 inline-block text-sm text-neutral-400 hover:text-black">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}