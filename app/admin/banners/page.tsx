"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Компонент одного баннера
const BannerItem = ({ slot, label, aspect, data, onChange, onSave }: any) => {
  const [uploading, setUploading] = useState(false);

  // Функция загрузки файла
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Ошибка при загрузке");

      const result = await res.json();
      const imageUrl = result.files[0].url;
      
      // Обновляем URL картинки в состоянии
      onChange(slot, 'imageUrl', imageUrl);
    } catch (err) {
      alert("Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title={label} className="space-y-4">
      <div className={`relative w-full ${aspect} bg-slate-100 rounded-[32px] overflow-hidden border mb-4 flex flex-col items-center justify-center transition-all`}>
        {data.imageUrl ? (
          <img src={data.imageUrl} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <div className="text-slate-400 text-[10px] font-black uppercase">Нет изображения</div>
        )}
        
        {/* Оверлей загрузки */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <span className="text-[10px] font-bold animate-pulse">ЗАГРУЗКА...</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Кнопка загрузки файла */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Загрузить файл с компьютера</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <Input 
          label="Заголовок баннера (текст поверх)" 
          value={data.title || ""} 
          onChange={(e) => onChange(slot, 'title', e.target.value)}
          placeholder="Например: Скидка 20% на всё"
        />
        
        <Input 
          label="Ссылка (куда ведет при клике)" 
          value={data.link || "/"} 
          onChange={(e) => onChange(slot, 'link', e.target.value)}
        />
      </div>
      
      <Button 
        className="w-full mt-4" 
        onClick={() => onSave(slot)}
        disabled={uploading}
      >
        Сохранить настройки баннера
      </Button>
    </Card>
  );
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any>({
    main: { imageUrl: '', title: '', link: '/' },
    'side-top': { imageUrl: '', title: '', link: '/' },
    'side-bottom': { imageUrl: '', title: '', link: '/' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const map = data.reduce((acc: any, b: any) => ({ ...acc, [b.slot]: b }), {});
          setBanners((prev: any) => ({ ...prev, ...map }));
        }
        setLoading(false);
      });
  }, []);

  const handleInputChange = (slot: string, field: string, value: string) => {
    setBanners((prev: any) => ({
      ...prev,
      [slot]: { ...prev[slot], [field]: value }
    }));
  };

  const saveBanner = async (slot: string) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, ...banners[slot] }),
      });
      if (res.ok) alert(`Баннер "${slot}" успешно обновлен!`);
    } catch (err) {
      alert("Ошибка при сохранении в базу");
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-300">Загрузка данных...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto mb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Управление промо</h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1">Настройка баннеров на главной странице</p>
          </div>
<Button onClick={() => window.location.href = '/'} variant="secondary" className="rounded-full px-8">
  На главную
</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="md:col-span-2">
            <BannerItem 
              slot="main" 
              label="1. Большой рекламный щит (Слева)" 
              aspect="aspect-[21/9]" 
              data={banners.main}
              onChange={handleInputChange}
              onSave={saveBanner}
            />
          </div>
          
          <BannerItem 
            slot="side-top" 
            label="2. Правый верхний блок" 
            aspect="aspect-video" 
            data={banners['side-top']}
            onChange={handleInputChange}
            onSave={saveBanner}
          />
          
          <BannerItem 
            slot="side-bottom" 
            label="3. Правый нижний блок" 
            aspect="aspect-video" 
            data={banners['side-bottom']}
            onChange={handleInputChange}
            onSave={saveBanner}
          />
        </div>
      </div>
    </div>
  );
}