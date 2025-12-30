"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ChevronLeft, Plus, X, Upload, Palette, LayoutGrid, Loader2 } from 'lucide-react';

// UI компоненты
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface Category { id: string; name: string; }
interface ProductType { id: string; name: string; hasMaterials: boolean; }
interface Tag { id: string; name: string; }

const lightInput = "bg-slate-50 border-slate-100 text-[#1e1b4b] placeholder:text-slate-400 focus:bg-white focus:border-[#7171a7] transition-all duration-300";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: "",
      categoryId: "", 
      typeId: "",
      bgColor: "#F8F7FF",
      badgeText: "",
      badgeColor: "neutral",
      imageUrl: "",
      requirements: [{ title: "", details: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "requirements" });

  useEffect(() => {
    async function fetchAttributes() {
      try {
        const res = await fetch('/api/admin/attributes');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setTypes(data.types || []);
        }
      } catch (error) { console.error("Ошибка загрузки:", error); }
      finally { setIsLoading(false); }
    }
    fetchAttributes();
  }, []);

  const watchedValues = watch();
  const showFileUpload = types.find(t => t.id === watchedValues.typeId)?.hasMaterials;
  const showRequirements = watchedValues.typeId && !showFileUpload;

  const onSubmit = async (data: any) => {
    try {
      const payload = { 
        ...data, 
        price: Number(String(data.price).replace(/\D/g, "")), 
        requirements: showRequirements ? data.requirements : [] 
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
      }
    } catch (error: any) { alert(error.message); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-[1400px]">
        
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
              Создание решения
            </h1>
          </div>

          <div className="flex-1 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10 py-4 bg-[#1e1b4b] text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-[#7171a7] transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Опубликовать
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-10">
              <div className="mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Основные параметры</h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Input 
                          label="Название продукта" 
                          placeholder="Напр: Финансовая модель ресторана"
                          {...register("title", { required: true })}
                          className={lightInput}
                        />
                    </div>
                    <div>
                        <Input 
                          label="Стоимость (₽)" 
                          placeholder="0"
                          value={watchedValues.price?.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                          onChange={(e) => setValue("price", e.target.value.replace(/\D/g, ""))}
                          className={`${lightInput} font-black text-indigo-600`}
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        label="Категория" 
                        options={categories.map(c => ({ value: c.id, label: c.name }))} 
                        value={field.value}
                        onChange={field.onChange}
                        className={lightInput} 
                      />
                    )}
                  />
                  <Controller
                    name="typeId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select 
                        label="Тип продукта" 
                        options={types.map(t => ({ value: t.id, label: t.name }))} 
                        value={field.value}
                        onChange={field.onChange}
                        className={lightInput} 
                        error={errors.typeId ? "Обязательное поле" : ""}
                      />
                    )}
                  />
                </div>

                <Textarea 
                  label="Краткое описание" 
                  rows={2} 
                  maxLength={60}
                  placeholder="Суть решения в двух словах..."
                  {...register("shortDescription")}
                  className={lightInput}
                />

                <Textarea 
                  label="Детальное описание" 
                  rows={6} 
                  placeholder="Опишите ценность продукта..."
                  {...register("description")}
                  className={lightInput}
                />
              </div>
            </section>

            {showRequirements && (
              <section className="rounded-[2.5rem] border border-slate-100 bg-white p-10">
                <h2 className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Требования для выполнения</h2>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex-1"><Input placeholder="Заголовок" {...register(`requirements.${index}.title` as const)} className="bg-white" /></div>
                        <div className="flex-[2]"><Input placeholder="Что нужно от клиента?" {...register(`requirements.${index}.details` as const)} className="bg-white" /></div>
                        <button type="button" onClick={() => remove(index)} className="h-12 w-12 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                    </div>
                    ))}
                    <button type="button" onClick={() => append({ title: "", details: "" })} className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7171a7] hover:opacity-70 transition-all">
                    <Plus size={16} /> Добавить поле
                    </button>
                </div>
              </section>
            )}
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 text-center">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Обложка товара</h3>
              <input type="file" id="imageInput" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setValue("imageUrl", reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
              <label htmlFor="imageInput" className="group relative flex aspect-square w-full cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-100 bg-slate-50 transition-all items-center justify-center hover:border-[#7171a7]">
                {watchedValues.imageUrl ? (
                  <img src={watchedValues.imageUrl} className="h-full w-full object-contain p-8" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <Upload size={32} className="mx-auto text-slate-200 mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Загрузить PNG</span>
                  </div>
                )}
              </label>
            </section>

            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-10">
              <div className="mb-8 flex items-center gap-3">
                <Palette className="text-slate-300" size={18} />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Визуализация</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-[1.2rem] border border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Цвет фона</span>
                  <input type="color" {...register("bgColor")} className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0 bg-transparent" />
                </div>
                
                <Input 
                  label="Бейдж" 
                  {...register("badgeText")} 
                  placeholder="NEW, HIT, -20%" 
                  className={lightInput} 
                />
                
                <Controller
                  name="badgeColor"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      label="Цвет бейджа" 
                      options={[
                        {value:'neutral', label:'Стеклянный'}, 
                        {value:'black', label:'Черный'}, 
                        {value:'red', label:'Красный'}, 
                        {value:'green', label:'Зеленый'}
                      ]} 
                      value={field.value}
                      onChange={field.onChange}
                      className={lightInput} 
                    />
                  )}
                />
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}