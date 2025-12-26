"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Product {
  id: string;
  title: string;
  price: number;
  published: boolean;
  shortDescription?: string;
  imageUrl?: string;
  category?: { name: string };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, published: !currentStatus } : p));
        router.refresh();
      }
    } catch (e) {
      alert("Ошибка сети");
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Удалить этот товар?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        router.refresh();
      } else {
        alert("Не удалось удалить товар. Используйте 'Скрыть', если он в заказах.");
      }
    } catch (e) {
      alert("Сетевая ошибка");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm font-medium text-slate-400 hover:text-black transition">← В меню</Link>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black">Товары ({products.length})</h1>
          </div>
          <Link href="/admin/products/create">
            <Button className="py-3 px-6 text-xs">+ Добавить товар</Button>
          </Link>
        </div>

        <Card className="p-0 overflow-hidden border-0 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <th className="p-5">Фото</th>
                  <th className="p-5">Название</th>
                  <th className="p-5">Статус</th>
                  <th className="p-5">Цена</th>
                  <th className="p-5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Загрузка...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Товаров нет</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className={`hover:bg-slate-50 transition ${!product.published ? 'opacity-50' : ''}`}>
                      <td className="p-5">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-100 bg-white">
                          {product.imageUrl && <Image src={product.imageUrl} alt="" fill className="object-contain p-1" />}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-black text-slate-900">{product.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{product.category?.name}</div>
                      </td>
                      <td className="p-5">
                        <button 
                          onClick={() => toggleVisibility(product.id, product.published)}
                          className={`rounded-full px-3 py-1 text-[10px] uppercase font-black transition-all ${
                            product.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                          }`}
                        >
                          {product.published ? "● Виден" : "○ Скрыт"}
                        </button>
                      </td>
                      <td className="p-5 font-black text-slate-900">{product.price.toLocaleString()} ₽</td>
                      <td className="p-5 text-right space-x-2">
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-50 transition">Изменить</button>
                        </Link>
                        <button onClick={() => handleDeleteOne(product.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition">X</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}