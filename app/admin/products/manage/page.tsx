"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Plus, Loader2, Trash2, Edit3, Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/admin/products" 
              className="group flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Каталог товаров
            </h1>
          </div>

          <div className="flex-1 flex justify-end">
            <Link href="/admin/products/create">
              <button className="px-8 py-4 bg-[#1e1b4b] text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-[#7171a7] transition-all flex items-center gap-3">
                <Plus size={14} />
                Добавить
              </button>
            </Link>
          </div>
        </div>

        {/* TABLE SECTION */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all hover:border-[#7171a7]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/30">
                  <th className="p-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pl-10">Продукт</th>
                  <th className="p-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Категория</th>
                  <th className="p-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Статус</th>
                  <th className="p-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Цена</th>
                  <th className="p-6 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pr-10">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Loader2 className="animate-spin inline text-slate-200" size={32} />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
                      Товары не найдены
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className={`group transition-all hover:bg-slate-50/50 ${!product.published ? 'opacity-60' : ''}`}>
                      <td className="p-5 pl-10">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                            {product.imageUrl ? (
                              <Image src={product.imageUrl} alt="" fill className="object-contain p-2" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-200">
                                <Plus size={16} />
                              </div>
                            )}
                          </div>
                          <span className="text-[13px] font-black uppercase tracking-tight text-[#1e1b4b]">
                            {product.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {product.category?.name || "—"}
                        </span>
                      </td>
                      <td className="p-5">
                        <button 
                          onClick={() => toggleVisibility(product.id, product.published)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all border ${
                            product.published 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {product.published ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.published ? "Виден" : "Скрыт"}
                        </button>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-black text-[#1e1b4b]">
                          {product.price.toLocaleString()} ₽
                        </span>
                      </td>
                      <td className="p-5 text-right pr-10">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#7171a7] hover:border-[#7171a7] transition-all">
                              <Edit3 size={16} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDeleteOne(product.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all"
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
        </section>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-50 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-200">
          <p>Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-emerald-500/50 tracking-widest text-[8px]">Управление каталогом активно</span>
          </div>
        </div>
      </div>
    </div>
  );
}