"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

// UI Компоненты
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';

// Типы
interface Category { id: string; name: string; }
interface ProductType { id: string; name: string; hasMaterials: boolean; }
interface Tag { id: string; name: string; }
interface Material { id?: string; name: string; url: string; size?: number; }

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: "",
      categoryId: "", 
      typeId: "",
      tags: [] as string[],
      bgColor: "#F3F4F6",
      badgeText: "",
      badgeColor: "neutral",
      imageUrl: ""
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    async function initData() {
      try {
        const [attrRes, productRes] = await Promise.all([
          fetch('/api/admin/attributes'),
          fetch(`/api/admin/products/${productId}`)
        ]);

        if (attrRes.ok) {
          const attrs = await attrRes.json();
          setCategories(attrs.categories || []);
          setTypes(attrs.types || []);
          setTagsList(attrs.tags || []);
        }

        if (productRes.ok) {
          const product = await productRes.json();
          
          if (product.materials) {
            setMaterials(product.materials);
          }

          setValue("typeId", product.typeId || "");

          reset({
            title: product.title || "",
            shortDescription: product.shortDescription || "",
            description: product.description || "",
            price: String(product.price || ""),
            categoryId: product.categoryId || "",
            typeId: product.typeId || "",
            tags: product.tags ? product.tags.map((t: any) => t.id) : [],
            bgColor: product.bgColor || "#F3F4F6",
            badgeText: product.badgeText || "",
            badgeColor: product.badgeColor || "neutral",
            imageUrl: product.imageUrl || ""
          });
        }
      } catch (error) {
        console.error("Ошибка:", error);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, [productId, reset, setValue]);

  const currentType = types.find(t => t.id === watchedValues.typeId);
  const shouldShowMaterials = currentType?.hasMaterials || materials.length > 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => formData.append("files", file));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setMaterials(prev => [...prev, ...data.files]);
      }
    } catch (error) {
      alert("Ошибка загрузки");
    } finally {
      setIsUploading(false);
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = { 
        ...data, 
        id: productId,
        price: Number(String(data.price).replace(/\D/g, "")),
        materials: materials 
      };

      const res = await fetch(`/api/admin/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Ошибка обновления');
      router.push('/admin/products/manage');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 text-slate-900 font-sans">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl">
        
        <div className="mb-8 flex items-center justify-between">
          <Link href="/admin/products/manage" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            ← Назад
          </Link>
          <Button type="submit" isLoading={isSubmitting} className="py-2 px-10">
            Сохранить изменения
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            
            {/* ТЕСТОВАЯ ПРАВКА: Заголовок стал КРАСНЫМ, слово ТЕГИ удалено */}
            <Card title="Классификация (ТЕСТ ЦВЕТА)" className="border-red-500 border-2">
              <div className="grid gap-6 md:grid-cols-2 mb-4">
                <Select label="Категория" options={categories.map(c => ({ value: c.id, label: c.name }))} {...register("categoryId")} />
                <Select label="Тип продукта" options={types.map(t => ({ value: t.id, label: t.name }))} {...register("typeId")} />
              </div>

              {/* Здесь раньше было слово ТЕГИ, теперь его нет */}

              {shouldShowMaterials && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">
                    Файлы в базе ({materials.length})
                  </h3>
                  
                  <div className="grid gap-3 mb-6">
                    {materials.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">📄</div>
                          <div className="truncate font-bold text-sm max-w-[280px]">{file.name}</div>
                        </div>
                        <button type="button" onClick={() => removeMaterial(idx)} className="text-slate-300 hover:text-red-500 transition-all">✕</button>
                      </div>
                    ))}
                  </div>

                  <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[32px] cursor-pointer hover:bg-blue-50 transition-all group">
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                    <div className="text-center">
                       <span className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all inline-block">
                          Добавить файлы
                       </span>
                    </div>
                  </label>
                </div>
              )}
            </Card>

            <Card title="Основные данные">
              <div className="space-y-6">
                <Input label="Название" {...register("title", { required: true })} />
                <Input label="Краткое описание" {...register("shortDescription")} />
                <Textarea label="Полное описание" rows={6} {...register("description")} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Фото">
                <input type="file" className="hidden" id="mainImg" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setValue("imageUrl", reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
                <label htmlFor="mainImg" className="block aspect-square w-full rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden cursor-pointer">
                  {watchedValues.imageUrl ? <img src={watchedValues.imageUrl} className="h-full w-full object-contain p-4" /> : <div className="flex h-full items-center justify-center text-slate-300 font-black uppercase text-[10px]">Загрузить фото</div>}
                </label>
            </Card>

            <Card title="Цена">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-3xl font-black outline-none" 
                  value={watchedValues.price}
                  onChange={(e) => setValue("price", e.target.value.replace(/\D/g, ""))}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-300 text-xl">₽</span>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}