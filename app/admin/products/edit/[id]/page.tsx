"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';

// Типы согласно твоей Schema Prisma
interface RequirementItem {
  title: string;
  details: string;
}

interface ProductFormValues {
  title: string;
  shortDescription: string;
  description: string;
  price: string;
  categoryId: string;
  typeId: string;
  bgColor: string;
  badgeText: string;
  badgeColor: string;
  imageUrl: string;
  requirements: RequirementItem[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  
  // Блокируем рендер формы, пока не получим ВСЕ данные
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { register, control, handleSubmit, watch, reset, setValue, formState: { isSubmitting } } = useForm<ProductFormValues>({
    defaultValues: {
      title: "", shortDescription: "", description: "", price: "",
      categoryId: "", typeId: "", bgColor: "#F3F4F6",
      badgeText: "", badgeColor: "neutral", imageUrl: "", requirements: [] 
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "requirements" });
  const watchedValues = watch();

  useEffect(() => {
    async function init() {
      try {
        // 1. Грузим справочники
        const attrRes = await fetch('/api/admin/attributes');
        const attrs = await attrRes.json();
        
        // Сразу сохраняем опции
        const loadedCategories = attrs.categories || [];
        const loadedTypes = attrs.types || [];
        setCategories(loadedCategories);
        setTypes(loadedTypes);

        // 2. Грузим продукт
        const productRes = await fetch(`/api/admin/products/${productId}`);
        const product = await productRes.json();

        // 3. Заполняем форму (приводим ID к строкам, чтобы Select их увидел)
        reset({
          title: product.title || "",
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          price: product.price ? String(product.price) : "",
          categoryId: product.categoryId ? String(product.categoryId) : "",
          typeId: product.typeId ? String(product.typeId) : "",
          bgColor: product.bgColor || "#F3F4F6",
          badgeText: product.badgeText || "",
          badgeColor: product.badgeColor || "neutral",
          imageUrl: product.imageUrl || "",
          requirements: Array.isArray(product.requirements) ? product.requirements : []
        });

        setIsDataLoaded(true);

      } catch (e) {
        console.error("Critical Error:", e);
        alert("Не удалось загрузить данные. Проверьте консоль.");
      }
    }
    init();
  }, [productId, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Number(String(data.price).replace(/\D/g, "")) // Чистим цену от символов
        }),
      });
      if (res.ok) {
        router.push('/admin/products/manage');
        router.refresh();
      }
    } catch (e) {
      alert("Ошибка сохранения");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setValue("imageUrl", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!isDataLoaded) return (
    <div className="min-h-screen flex items-center justify-center font-black text-indigo-500 animate-pulse uppercase tracking-widest">
      Загрузка данных...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 text-slate-900">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/admin/products/manage" className="text-sm font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">← Отмена</Link>
          <Button type="submit" isLoading={isSubmitting} className="rounded-full px-8 py-6 bg-[#1e1b4b]">СОХРАНИТЬ</Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* КЛАССИФИКАЦИЯ (Z-INDEX 30 - Самый высокий, чтобы списки были поверх всего) */}
            <div className="relative z-30">
              <Card title="Классификация">
                <div className="grid gap-6 md:grid-cols-2">
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        label="Категория"
                        options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="typeId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        label="Тип продукта"
                        options={types.map(t => ({ value: String(t.id), label: t.name }))}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Конструктор требований</h3>
                    <button
                      type="button"
                      onClick={() => append({ title: "", details: "" })}
                      className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-end animate-in slide-in-from-top-2">
                        <div className="flex-1">
                          <Input label={index === 0 ? "Заголовок" : ""} {...register(`requirements.${index}.title`)} />
                        </div>
                        <div className="flex-[2]">
                          <Input label={index === 0 ? "Детали" : ""} {...register(`requirements.${index}.details`)} />
                        </div>
                        <button type="button" onClick={() => remove(index)} className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mb-1">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* ОСНОВНЫЕ ДАННЫЕ (Z-INDEX 10 - Ниже, чем классификация) */}
            <div className="relative z-10">
              <Card title="Основные данные">
                <div className="space-y-6">
                  <Input label="Название" {...register("title")} />
                  <Input label="Краткое описание" {...register("shortDescription")} />
                  <Textarea label="Описание" rows={6} {...register("description")} />
                </div>
              </Card>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="space-y-8">
            
            {/* ВИЗУАЛ (Z-INDEX 30 - Высокий приоритет) */}
            <div className="relative z-30">
              <Card title="Визуал">
                 <div className="space-y-6">
                   <div className="p-4 bg-slate-50 rounded-[32px] border border-slate-100">
                      {watchedValues.imageUrl ? (
                        <img src={watchedValues.imageUrl} className="w-full h-40 object-contain rounded-xl" alt="Preview" />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center text-slate-300 font-black uppercase text-[10px]">Нет превью</div>
                      )}
                   </div>
                   
                   <div className="relative">
                      <input type="file" id="file-upload" className="hidden" onChange={handleImageUpload} />
                      <label htmlFor="file-upload" className="block w-full text-center py-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-colors text-xs font-bold uppercase tracking-widest text-slate-400">
                        Загрузить фото
                      </label>
                   </div>

                   <Input label="HEX Цвет фона" {...register("bgColor")} />
                   <Input label="Текст на бейдже" {...register("badgeText")} />
                 </div>
              </Card>
            </div>

            {/* БЕЙДЖ (Z-INDEX 20 - Выше цены, но ниже визуала) */}
            <div className="relative z-20">
              <Card title="Настройка бейджа">
                <Controller
                  name="badgeColor"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      label="Цвет бейджа"
                      options={[
                        { value: "neutral", label: "Прозрачный" },
                        { value: "black", label: "Черный" },
                        { value: "red", label: "Красный" },
                        { value: "green", label: "Зеленый" }
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Card>
            </div>

            {/* КОММЕРЦИЯ (Z-INDEX 10 - Самый низкий) */}
            <div className="relative z-10">
              <Card title="Коммерция">
                 <Input label="Цена ₽" {...register("price")} />
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}