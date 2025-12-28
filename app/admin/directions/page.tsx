"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit2, ImageIcon, Loader2, 
  Globe, ArrowLeft, Clock, LayoutGrid, CheckCircle2 
} from "lucide-react";
import Image from "next/image";

export default function DirectionsAdmin() {
  const [directions, setDirections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    title: "",
    subtitle: "",
    href: "",
    imageUrl: "",
    order: 0,
    isComingSoon: false,
    activeColor: "shadow-indigo-500/20 text-indigo-600 border-indigo-100",
    bgColor: "#F8FAFC"
  };

  const [formData, setFormData] = useState(initialForm);
  const router = useRouter();

  useEffect(() => { fetchDirections(); }, []);

  const fetchDirections = async () => {
    try {
      const res = await fetch("/api/admin/directions");
      const data = await res.json();
      setDirections(data);
    } catch (err) { 
      console.error("Ошибка загрузки"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const data = new FormData();
    data.append("files", e.target.files[0]);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.success && json.files?.[0]?.url) {
        setFormData(p => ({ ...p, imageUrl: json.files[0].url }));
      }
    } catch (err) { 
      alert("Ошибка загрузки"); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { 
      ...formData, 
      href: formData.isComingSoon ? (formData.href || "#") : formData.href 
    };
    
    const method = isEditing ? "PATCH" : "POST";
    const url = isEditing ? `/api/admin/directions?id=${isEditing}` : "/api/admin/directions";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        setIsEditing(null);
        setFormData(initialForm);
        // Принудительное обновление списка для отправки на главную
        await fetchDirections(); 
        router.refresh(); // Обновляем серверные компоненты Next.js
      }
    } catch (err) {
      alert("Ошибка при сохранении");
    }
  };

  const deleteDirection = async (id: string) => {
    if (!confirm("Удалить направление?")) return;
    await fetch(`/api/admin/directions?id=${id}`, { method: "DELETE" });
    fetchDirections();
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 pt-8 px-4 font-sans">
      <div className="max-w-[900px] mx-auto">
        
        {/* КОМПАКТНЫЙ ХЕДЕР */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')} 
              className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-[#1e1b4b]">Экосистема</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Unit One Control Panel</p>
              </div>
            </div>
          </div>
        </header>

        {/* ФОРМА (Сделана компактнее в один ряд на десктопе) */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              {isEditing ? <Edit2 size={14}/> : <Plus size={14}/>}
            </div>
            <h2 className="text-sm font-black uppercase text-[#1e1b4b]">
              {isEditing ? "Изменение данных" : "Новое направление"}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ЛОГОТИП */}
              <div className="flex flex-col items-center">
                <div className="relative group w-full aspect-square max-w-[160px] bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-400 transition-all">
                  {formData.imageUrl ? (
                    <>
                      <Image src={formData.imageUrl} alt="P" fill className="object-contain p-6" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-[8px] font-black text-white uppercase">Изменить</span>
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="text-slate-300" size={28} />
                  )}
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={20} /></div>}
                </div>
              </div>

              {/* ПОЛЯ ВВОДА */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Название (лат.)</label>
                  <input 
                    className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-500 transition-all outline-none" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Заголовок (RU)</label>
                  <input 
                    className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-500 transition-all outline-none" 
                    value={formData.subtitle} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Ссылка</label>
                  <input 
                    className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-500 transition-all outline-none" 
                    value={formData.href} 
                    onChange={e => setFormData({...formData, href: e.target.value})} 
                    required={!formData.isComingSoon} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Приоритет</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold text-[#1e1b4b] focus:bg-white focus:border-indigo-500 transition-all outline-none" 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-5 rounded-full transition-all relative ${formData.isComingSoon ? 'bg-amber-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isComingSoon ? 'left-6' : 'left-1'}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.isComingSoon} 
                  onChange={e => setFormData({...formData, isComingSoon: e.target.checked})} 
                />
                <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-amber-600 transition-colors">Coming Soon Mode</span>
              </label>

              <div className="flex gap-2 w-full sm:w-auto">
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={() => { setIsEditing(null); setFormData(initialForm); }} 
                    className="flex-1 sm:px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Отмена
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-[2] sm:px-10 py-3 bg-[#1e1b4b] text-white rounded-xl font-black uppercase text-[9px] tracking-[0.2em] shadow-lg shadow-indigo-900/10 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isEditing ? "Обновить данные" : "Создать проект"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* СПИСОК (Компактные карточки) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Активные проекты</h3>
            <span className="text-[9px] font-bold text-slate-300">{directions.length} направлений</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {directions.map((d) => (
              <div 
                key={d.id} 
                className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden p-2 border border-slate-100">
                    {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-contain" alt="" /> : <Globe size={16} className="text-slate-300"/>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-[#1e1b4b] uppercase text-[11px] tracking-tight">{d.title}</h4>
                      {d.isComingSoon && (
                        <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter">Soon</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight">{d.subtitle}</p>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => {
                      setIsEditing(d.id);
                      setFormData({ ...d, subtitle: d.subtitle || "" });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="w-9 h-9 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => deleteDirection(d.id)} 
                    className="w-9 h-9 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}