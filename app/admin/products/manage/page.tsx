"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Plus, Loader2, Trash2, Edit3, Eye, EyeOff, Package } from "lucide-react";

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
        alert("Не удалось удалить. Возможно, товар есть в заказах.");
      }
    } catch (e) {
      alert("Сетевая ошибка");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-[#111827] tracking-tight">Каталог товаров</h1>
            <p className="text-sm text-gray-500 font-medium">Управление ассортиментом решений</p>
          </div>
        </div>

        <Link href="/admin/products/create">
          <button className="px-6 py-3 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <Plus size={18} />
            Добавить товар
          </button>
        </Link>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-soft overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-8">Продукт</th>
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Категория</th>
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Статус</th>
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Цена</th>
                <th className="p-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-8">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin inline text-[#10b981]" size={32} />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <Package size={48} strokeWidth={1} />
                      <p className="text-sm font-bold uppercase tracking-widest">Товары не найдены</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`group transition-all hover:bg-gray-50 ${!product.published ? 'bg-gray-50/30' : ''}`}>
                    <td className="p-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt="" fill className="object-contain p-2" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-200">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#111827] group-hover:text-[#10b981] transition-colors">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {product.category?.name || "Без категории"}
                      </span>
                    </td>
                    <td className="p-5">
                      <button 
                        onClick={() => toggleVisibility(product.id, product.published)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          product.published 
                          ? 'bg-[#ecfdf5] text-[#10b981] border-[#d1fae5] hover:bg-[#10b981] hover:text-white' 
                          : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {product.published ? <Eye size={14} /> : <EyeOff size={14} />}
                        {product.published ? "Виден" : "Скрыт"}
                      </button>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-bold text-[#111827]">
                        {product.price.toLocaleString()} ₽
                      </span>
                    </td>
                    <td className="p-5 text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-[#10b981] hover:border-[#10b981] hover:bg-[#ecfdf5] transition-all">
                            <Edit3 size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteOne(product.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}