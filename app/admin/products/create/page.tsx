"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ChevronLeft, Plus, X, Upload, Palette, LayoutGrid, Loader2, Save, Image as ImageIcon } from 'lucide-react';

// UI компоненты
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface Category { id: string; name: string; }
interface ProductType { id: string; name: string; hasMaterials: boolean; }

// Обновленный стиль инпутов под новый дизайн
const lightInput = "bg-gray-50 border-transparent focus:bg-white focus:border-[#10b981] text-[#111827] placeholder:text-gray-400 transition-all duration-300 rounded-xl px-4 py-3";

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
      bgColor: "#ffffff",
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
      } catch (error) { 
        console.error("Ошибка загрузки:", error); 
      } finally { 
        setIsLoading(false); 
      }
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
    } catch (error: any) { 
      alert(error.message); 
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#10b981]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2 mb-10">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/products" 
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight">Создание</h1>
              <p className="text-sm text-gray-500 font-medium">Новое решение в каталоге</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Опубликовать
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-[2.5rem] bg-white p-8 shadow-soft border border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 px-1">Основные параметры</h2>
              
              <div className="space-y-6">
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
                          className={`${lightInput} font-bold text-[#10b981]`}
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
                  maxLength={100}
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
              <section className="rounded-[2.5rem] bg-white p-8 shadow-soft border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Требования от клиента</h2>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-6 rounded-2xl">
                        <div className="flex-1 space-y-4">
                          <Input placeholder="Название документа" {...register(`requirements.${index}.title` as const)} className="bg-white border-transparent focus:border-[#10b981]" />
                          <Input placeholder="Что именно нужно?" {...register(`requirements.${index}.details` as const)} className="bg-white border-transparent focus:border-[#10b981]" />
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
                    <button 
                      type="button" 
                      onClick={() => append({ title: "", details: "" })} 
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#10b981] hover:bg-[#ecfdf5] rounded-lg transition-all"
                    >
                      <Plus size={16} /> Добавить параметр
                    </button>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: SETTINGS */}
          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-[2.5rem] bg-white p-6 shadow-soft border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Обложка</h3>
              <input 
                type="file" 
                id="imageInput" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setValue("imageUrl", reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              <label 
                htmlFor="imageInput" 
                className="group relative flex aspect-square w-full cursor-pointer overflow-hidden rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 transition-all items-center justify-center hover:border-[#10b981] hover:bg-emerald-50/30"
              >
                {watchedValues.imageUrl ? (
                  <img src={watchedValues.imageUrl} className="h-full w-full object-contain p-6 transition-transform group-hover:scale-105" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-gray-300 group-hover:text-[#10b981]">
                      <Upload size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-gray-500">Загрузить образ</span>
                  </div>
                )}
              </label>
            </section>

            <section className="rounded-[2.5rem] bg-white p-8 shadow-soft border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <Palette className="text-gray-300" size={18} />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Визуал</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <span className="text-xs font-bold text-gray-500">Цвет фона</span>
                  <input 
                    type="color" 
                    {...register("bgColor")} 
                    className="h-8 w-8 cursor-pointer rounded-lg border-2 border-white shadow-sm overflow-hidden" 
                  />
                </div>
                
                <Input 
                  label="Текст бейджа" 
                  {...register("badgeText")} 
                  placeholder="NEW, HIT, -20%" 
                  className={lightInput} 
                />
                
                <Controller
                  name="badgeColor"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      label="Стиль бейджа" 
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