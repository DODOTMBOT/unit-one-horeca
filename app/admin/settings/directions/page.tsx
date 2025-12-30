"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit2, ImageIcon, Loader2, 
  Globe, ArrowLeft, LogOut, CheckCircle2, GripVertical
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
        await fetchDirections(); 
        router.refresh();
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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="h-6 w-6 animate-spin text-[#1e1b4b]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1200px] mx-auto">
        
        {/* TOP INTERFACE BAR */}
        <div className="flex items-center justify-between mb-20">
          <div className="flex-1 hidden md:flex justify-start">
             <button onClick={() => router.push('/admin')} className="w-12 h-12 bg-white border border-slate-100 rounded-[1.2rem] flex items-center justify-center text-slate-400 hover:text-[#1e1b4b] transition-colors shadow-sm">
                <ArrowLeft size={18} />
             </button>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Управление экосистемой
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-2">
            <Link href="/admin" className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Админка</p>
            </Link>
            <Link href="/api/auth/signout" className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors shadow-sm">
              <LogOut size={18} />
            </Link>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm mb-12">
          <div className="mb-10 flex items-center gap-3">
             <div className="h-1 w-8 bg-indigo-500 rounded-full" />
             <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">
               {isEditing ? "Редактирование проекта" : "Новое направление"}
             </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT: IMAGE UPLOAD */}
            <div className="lg:col-span-3 flex flex-col items-center gap-4">
               <div className="relative group w-full aspect-square bg-[#F8FAFC] rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-200 shadow-inner">
                  {formData.imageUrl ? (
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-contain p-8" />
                  ) : (
                    <ImageIcon className="text-slate-200" size={40} />
                  )}
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">SVG / PNG / 512px</p>
            </div>

            {/* RIGHT: INPUTS */}
            <div className="lg:col-span-9 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Название (LATIN)</label>
                    <input 
                      className="w-full bg-[#F8FAFC] border-transparent border focus:border-indigo-100 rounded-[1.2rem] px-6 py-4 text-sm font-bold text-[#1e1b4b] outline-none transition-all" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="Напр. HUNTER"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Заголовок (RU)</label>
                    <input 
                      className="w-full bg-[#F8FAFC] border-transparent border focus:border-indigo-100 rounded-[1.2rem] px-6 py-4 text-sm font-bold text-[#1e1b4b] outline-none transition-all" 
                      value={formData.subtitle} 
                      onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                      placeholder="Напр. Менеджер офиса"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Внутренняя ссылка (Route)</label>
                    <input 
                      className="w-full bg-[#F8FAFC] border-transparent border focus:border-indigo-100 rounded-[1.2rem] px-6 py-4 text-sm font-bold text-[#1e1b4b] outline-none transition-all" 
                      value={formData.href} 
                      onChange={e => setFormData({...formData, href: e.target.value})} 
                      placeholder="/admin/something"
                      required={!formData.isComingSoon} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Порядок</label>
                    <input 
                      type="number"
                      className="w-full bg-[#F8FAFC] border-transparent border focus:border-indigo-100 rounded-[1.2rem] px-6 py-4 text-sm font-bold text-[#1e1b4b] outline-none transition-all" 
                      value={formData.order} 
                      onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                    />
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
                  <button 
                    type="button"
                    onClick={() => setFormData(p => ({...p, isComingSoon: !p.isComingSoon}))}
                    className={`px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${formData.isComingSoon ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    {formData.isComingSoon ? "● Mode: Coming Soon" : "○ Mode: Active"}
                  </button>

                  <div className="flex gap-2 w-full sm:w-auto">
                    {isEditing && (
                      <button type="button" onClick={() => { setIsEditing(null); setFormData(initialForm); }} className="px-8 py-4 bg-slate-50 text-slate-400 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Отмена
                      </button>
                    )}
                    <button type="submit" className="flex-1 sm:flex-none px-12 py-4 bg-[#1e1b4b] text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-900 transition-all shadow-lg shadow-indigo-900/10">
                      {isEditing ? "Сохранить изменения" : "Добавить в экосистему"}
                    </button>
                  </div>
               </div>
            </div>
          </form>
        </div>

        {/* COMPACT LIST SECTION */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Список направлений ({directions.length})</h3>
            <div className="flex gap-8">
               <span className="text-[9px] font-bold uppercase text-slate-300">Статус</span>
               <span className="text-[9px] font-bold uppercase text-slate-300 mr-24">Действия</span>
            </div>
          </div>
          
          <div className="divide-y divide-slate-50">
            {directions.sort((a,b) => a.order - b.order).map((d) => (
              <div key={d.id} className="group flex items-center justify-between px-8 py-4 hover:bg-slate-50/30 transition-colors">
                
                <div className="flex items-center gap-6">
                  <div className="w-4 text-slate-200 group-hover:text-slate-300 transition-colors">
                    <GripVertical size={14} />
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                    {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-contain" alt="" /> : <Globe size={18} className="text-slate-100"/>}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-tight text-[#1e1b4b]">{d.title}</span>
                      <span className="text-[9px] font-bold text-slate-300 px-2 border border-slate-100 rounded-md">#{d.order}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">{d.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="w-24 flex justify-center">
                    {d.isComingSoon ? (
                      <span className="text-[8px] font-black uppercase bg-amber-50 text-amber-500 px-3 py-1 rounded-full border border-amber-100">Coming Soon</span>
                    ) : (
                      <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-500 px-3 py-1 rounded-full border border-emerald-100">Active</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsEditing(d.id); setFormData({...d, subtitle: d.subtitle || ""}); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                      className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteDirection(d.id)} 
                      className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
          
          {directions.length === 0 && (
            <div className="p-20 text-center">
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Проекты не найдены</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}