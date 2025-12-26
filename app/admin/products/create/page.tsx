"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form'; // Добавлен Controller
import { ChevronLeft, Plus, X, Upload, Palette, LayoutGrid } from 'lucide-react';

// UI компоненты
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface Category { id: string; name: string; }
interface ProductType { id: string; name: string; hasMaterials: boolean; }
interface Tag { id: string; name: string; }

const badgePalette: Record<string, string> = {
  neutral: "bg-white/20 text-white backdrop-blur-md border border-white/20",
  black: "bg-black/80 text-white backdrop-blur-md",
  red: "bg-red-500/80 text-white backdrop-blur-md",
  green: "bg-emerald-500/80 text-white backdrop-blur-md",
};

const lightInput = "bg-slate-50 border-slate-200 text-[#1e1b4b] placeholder:text-slate-400 focus:bg-white focus:border-[#a78bfa]";
const darkInput = "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 focus:ring-0";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: "",
      categoryId: "", 
      typeId: "",
      tags: [] as string[],
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
          setTagsList(data.tags || []);
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
      let uploadedMaterials = [];
      if (showFileUpload && selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("files", file));
        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        uploadedMaterials = uploadData.files; 
      }

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
    <div className="min-h-screen bg-[#F1F3F6] pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-[1400px] px-6 pt-10">
        
        <header className="sticky top-6 z-40 mb-10 flex h-20 items-center justify-between rounded-full border border-slate-200 bg-white/90 px-8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-6">
            <Link href="/admin/products" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm hover:scale-110 transition-all">
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-purple-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-[#1e1b4b]">Создание решения</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Конфигурация продукта</p>
            </div>
          </div>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="rounded-full bg-[#1e1b4b] px-10 py-3 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-600 transition-all shadow-xl"
          >
            Опубликовать
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          <div className="lg:col-span-8 space-y-8">
            <section className="rounded-[40px] border border-white bg-white p-10 shadow-xl">
              <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
                <LayoutGrid className="text-purple-500" size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#1e1b4b]">Основные параметры</h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                          className={`${lightInput} font-black text-xl text-purple-600`}
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                  label="Краткое описание (для карточки)" 
                  rows={2} 
                  maxLength={60}
                  placeholder="Короткий слоган или суть решения..."
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

            {(showFileUpload || showRequirements) && (
              <section className="rounded-[40px] border border-white bg-white p-10 shadow-xl animate-in slide-in-from-bottom-4">
                <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-[#1e1b4b]">
                   {showFileUpload ? "Файлы продукта" : "Требования для выполнения"}
                </h2>
                {showRequirements && (
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <div className="flex-1"><Input placeholder="Заголовок" {...register(`requirements.${index}.title` as const)} className="bg-white" /></div>
                            <div className="flex-[2]"><Input placeholder="Что нужно от клиента?" {...register(`requirements.${index}.details` as const)} className="bg-white" /></div>
                            <button type="button" onClick={() => remove(index)} className="h-12 w-12 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
                        </div>
                        ))}
                        <button type="button" onClick={() => append({ title: "", details: "" })} className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600">
                        <Plus size={16} /> Добавить поле
                        </button>
                    </div>
                )}
              </section>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="rounded-[40px] border border-white bg-white p-8 shadow-xl text-center">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Обложка товара</h3>
              <input type="file" id="imageInput" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setValue("imageUrl", reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
              <label htmlFor="imageInput" className="group relative flex aspect-square w-full cursor-pointer overflow-hidden rounded-[48px] border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all items-center justify-center">
                {watchedValues.imageUrl ? (
                  <img src={watchedValues.imageUrl} className="h-full w-full object-contain p-8" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Загрузить PNG</span>
                  </div>
                )}
              </label>
            </section>

            <section className="rounded-[40px] border border-[#1e1b4b] bg-[#1e1b4b] p-10 shadow-2xl text-white">
              <div className="mb-6 flex items-center gap-3">
                <Palette className="text-purple-400" size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest">Визуализация</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Цвет фона</span>
                  <input type="color" {...register("bgColor")} className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0" />
                </div>
                
                <Input 
                  label="Бейдж" 
                  {...register("badgeText")} 
                  placeholder="NEW, HIT, -20%" 
                  className={darkInput} 
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
                      className={darkInput} 
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