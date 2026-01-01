"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { 
  ChevronLeft, 
  Save, 
  Loader2, 
  Plus, 
  X, 
  LayoutGrid, 
  Palette, 
  Tag, 
  CircleDollarSign,
  Image as ImageIcon,
  Upload
} from "lucide-react";

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

// Дизайн-токены согласно вашему новому стилю
const lightInput = "bg-gray-50 border-transparent focus:bg-white focus:border-[#10b981] text-[#111827] placeholder:text-gray-400 transition-all duration-300 rounded-xl px-4 py-3";

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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { register, control, handleSubmit, watch, reset, setValue, formState: { isSubmitting } } = useForm<ProductFormValues>({
    defaultValues: {
      title: "", shortDescription: "", description: "", price: "",
      categoryId: "", typeId: "", bgColor: "#ffffff",
      badgeText: "", badgeColor: "neutral", imageUrl: "", requirements: [] 
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "requirements" });
  const watchedValues = watch();

  useEffect(() => {
    async function init() {
      try {
        const attrRes = await fetch('/api/admin/attributes');
        const attrs = await attrRes.json();
        setCategories(attrs.categories || []);
        setTypes(attrs.types || []);

        const productRes = await fetch(`/api/admin/products/${productId}`);
        const product = await productRes.json();

        reset({
          title: product.title || "",
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          price: product.price ? String(product.price) : "",
          categoryId: product.categoryId ? String(product.categoryId) : "",
          typeId: product.typeId ? String(product.typeId) : "",
          bgColor: product.bgColor || "#ffffff",
          badgeText: product.badgeText || "",
          badgeColor: product.badgeColor || "neutral",
          imageUrl: product.imageUrl || "",
          requirements: Array.isArray(product.requirements) ? product.requirements : []
        });

        setIsDataLoaded(true);
      } catch (e) {
        console.error("Critical Error:", e);
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
          price: Number(String(data.price).replace(/\D/g, ""))
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
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-[#10b981]" size={32} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2 mb-10">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/products/manage" 
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight">Редактирование</h1>
              <p className="text-sm text-gray-500 font-medium">Обновление параметров решения</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Сохранить изменения
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: CONTENT & CLASSIFICATION */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Основные данные */}
            <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <LayoutGrid className="text-gray-300" size={18} />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Контент</h2>
              </div>
              
              <div className="space-y-6">
                <Input label="Название" {...register("title")} className={lightInput} />
                <Input label="Краткое описание" {...register("shortDescription")} className={lightInput} maxLength={100} />
                <Textarea label="Описание" rows={6} {...register("description")} className={lightInput} />
              </div>
            </section>

            {/* Классификация и требования */}
            <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <Tag className="text-gray-300" size={18} />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Классификация</h2>
              </div>

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
                      className={lightInput}
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
                      className={lightInput}
                    />
                  )}
                />
              </div>

              {/* Требования */}
              <div className="mt-10 pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Требования от клиента</h3>
                  <button
                    type="button"
                    onClick={() => append({ title: "", details: "" })}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#10b981] hover:bg-[#ecfdf5] rounded-lg transition-all"
                  >
                    <Plus size={16} /> Добавить параметр
                  </button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex-1 space-y-4">
                        <Input placeholder="Документ или доступ" {...register(`requirements.${index}.title`)} className="bg-white" />
                        <Input placeholder="Детали требования" {...register(`requirements.${index}.details`)} className="bg-white" />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => remove(index)} 
                        className="mt-1 h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: VISUAL & COMMERCE */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Обложка */}
            <section className="rounded-[2.5rem] bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Обложка</h3>
              <div className="group relative flex aspect-square w-full overflow-hidden rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-100 items-center justify-center">
                {watchedValues.imageUrl ? (
                  <img src={watchedValues.imageUrl} className="h-full w-full object-contain p-6" alt="Preview" />
                ) : (
                  <ImageIcon className="text-gray-200" size={48} strokeWidth={1} />
                )}
                
                <label className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center bg-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  <Upload className="mb-2 text-[#10b981]" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Заменить фото</span>
                </label>
              </div>
            </section>

            {/* Визуал */}
            <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <Palette className="text-gray-300" size={18} />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Визуал</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <span className="text-xs font-bold text-gray-500">Цвет фона</span>
                  <input type="color" {...register("bgColor")} className="h-8 w-8 cursor-pointer rounded-lg border-2 border-white shadow-sm" />
                </div>
                
                <Input label="Бейдж" {...register("badgeText")} placeholder="HIT, NEW, -10%" className={lightInput} />
                
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
                      className={lightInput}
                    />
                  )}
                />
              </div>
            </section>

            {/* Коммерция */}
            <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <CircleDollarSign className="text-gray-300" size={18} />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Коммерция</h2>
              </div>
              <Input label="Цена ₽" {...register("price")} className={`${lightInput} font-bold text-[#10b981] text-lg`} />
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}