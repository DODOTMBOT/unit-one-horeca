'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Material {
  name: string;
  url: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  productType?: { name: string; hasMaterials: boolean };
  materials?: Material[];
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Загрузка реальных данных из БД
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки товара:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // 2. Улучшенная логика подсчета форматов файлов
  const getFileStats = (materials?: Material[]) => {
    if (!materials || materials.length === 0) return null;

    const stats = materials.reduce((acc: Record<string, number>, file) => {
      // Получаем расширение корректно, отсекая всё до последней точки
      const parts = file.name.split('.');
      const extension = parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
      
      acc[extension] = (acc[extension] || 0) + 1;
      return acc;
    }, {});

    // Формируем массив строк и соединяем их через запятую
    return Object.entries(stats)
      .map(([ext, count]) => `${ext}: ${count}`)
      .join(', ');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-neutral-500 font-medium">Загрузка данных...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-neutral-500 font-medium">Товар не найден</div>;

  const fileStatsString = getFileStats(product.materials);
  const typeLabel = product.productType?.name || 'Товар';

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        {/* Хедер страницы */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 transition hover:text-black">
            <span>←</span> Назад
          </Link>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
            {typeLabel}
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Левая колонка: Описание */}
          <section className="space-y-6">
            <h1 className="text-4xl font-black leading-tight tracking-tighter text-neutral-900 sm:text-5xl uppercase">
              {product.title}
            </h1>
            <p className="text-lg leading-relaxed text-neutral-600">
              {product.description}
            </p>
            
            <div className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
              <span className="text-2xl">⬇️</span>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Как это работает</div>
                <p className="text-sm font-medium leading-relaxed text-neutral-700">
                  Мгновенная доставка. Ссылка на скачивание комплекта придет на вашу почту сразу после оплаты.
                </p>
              </div>
            </div>
          </section>

          {/* Правая колонка: Сайдбар */}
          <aside className="space-y-6">
            {/* Блок стоимости */}
            <div className="h-fit rounded-[32px] border border-neutral-100 bg-white p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]">
              <div className="space-y-8">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Стоимость</div>
                  <div className="mt-2 text-4xl font-black text-neutral-900 tracking-tighter">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <Link
                  href={`/checkout/${product.id}`}
                  className="block w-full rounded-2xl bg-neutral-900 py-4 text-center text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-black hover:shadow-xl active:scale-[0.98]"
                >
                  Купить и скачать
                </Link>
              </div>
            </div>

            {/* Блок: Что Вы получите (отображается только если есть файлы) */}
            {fileStatsString && (
              <div className="h-fit rounded-[32px] border border-neutral-100 bg-white p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 italic">
                  Что Вы получите
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shrink-0 shadow-lg shadow-neutral-200">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tight mb-1">
                      Состав материалов:
                    </div>
                    <div className="text-sm font-black text-neutral-900 leading-tight uppercase tracking-tighter">
                      {fileStatsString}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-neutral-50">
                  <p className="text-[9px] font-bold text-neutral-400 leading-relaxed italic uppercase tracking-wider">
                    * Ссылка на скачивание всех материалов будет доступна в личном кабинете сразу после оплаты.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}