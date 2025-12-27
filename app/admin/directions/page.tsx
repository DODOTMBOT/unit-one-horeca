"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit2, ImageIcon, Loader2, Globe, ArrowLeft 
} from "lucide-react";
import Image from "next/image";

export default function DirectionsAdmin() {
  const [directions, setDirections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    href: "",
    imageUrl: "",
    order: 0,
    activeColor: "shadow-indigo-500/20 text-indigo-600 border-indigo-100",
    bgColor: "#F8FAFC"
  });

  const router = useRouter();

  useEffect(() => {
    fetchDirections();
  }, []);

  const fetchDirections = async () => {
    try {
      const res = await fetch("/api/admin/directions");
      const data = await res.json();
      setDirections(data);
    } catch (err) {
      console.error("Ошибка загрузки направлений");
    } finally {
      setLoading(false);
    }
  };

  // Загрузка файла через твой существующий API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append("files", file); // Твой API ждет ключ "files"

    try {
      const res = await fetch("/api/admin/upload", { 
        method: "POST", 
        body: data 
      });
      const json = await res.json();
      
      if (json.success && json.files?.[0]?.url) {
        setFormData(prev => ({ ...prev, imageUrl: json.files[0].url }));
      }
    } catch (err) {
      alert("Ошибка при загрузке файла");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? "PATCH" : "POST";
    const url = isEditing ? `/api/admin/directions?id=${isEditing}` : "/api/admin/directions";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsEditing(null);
      setFormData({ 
        title: "", subtitle: "", href: "", imageUrl: "", 
        order: 0, activeColor: "shadow-indigo-500/20 text-indigo-600 border-indigo-100", 
        bgColor: "#F8FAFC" 
      });
      fetchDirections();
    }
  };

  const deleteDirection = async (id: string) => {
    if (!confirm("Удалить это направление?")) return;
    await fetch(`/api/admin/directions?id=${id}`, { method: "DELETE" });
    fetchDirections();
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-10 px-6">
      <div className="max-w-[1000px] mx-auto">
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')}
              className="p-3 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={20} className="text-[#1e1b4b]" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-[#1e1b4b]">Направления</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Экосистема Unit One</p>
            </div>
          </div>
        </header>

        {/* FORM CARD */}
        <div className="bg-white rounded-[45px] p-10 border border-white shadow-sm mb-12">
          <h2 className="text-xl font-black uppercase text-[#1e1b4b] mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              {isEditing ? <Edit2 size={16}/> : <Plus size={16}/>}
            </div>
            {isEditing ? "Редактировать направление" : "Новое направление"}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Название (лат.)</label>
                <input 
                  className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 text-sm font-bold text-[#1e1b4b] focus:ring-2 ring-indigo-500 transition-all"
                  placeholder="Marketplace"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Подзаголовок (RU)</label>
                <input 
                  className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 text-sm font-bold text-[#1e1b4b]"
                  placeholder="Магазин"
                  value={formData.subtitle}
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Ссылка</label>
                <input 
                  className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 text-sm font-bold text-[#1e1b4b]"
                  placeholder="/marketplace"
                  value={formData.href}
                  onChange={e => setFormData({...formData, href: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Порядок</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 text-sm font-bold text-[#1e1b4b]"
                  placeholder="0"
                  value={formData.order}
                  onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Логотип (загрузка)</label>
                <div className="relative group overflow-hidden bg-slate-50 rounded-[35px] border-2 border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center p-4 transition-all hover:border-indigo-400">
                  {formData.imageUrl ? (
                    <>
                      <Image src={formData.imageUrl} alt="Preview" fill className="object-contain p-8" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <label className="cursor-pointer bg-white text-[#1e1b4b] px-6 py-2 rounded-full text-[10px] font-black uppercase">Изменить</label>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                        <ImageIcon className="text-slate-300" size={24} />
                      </div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Кликни для загрузки</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="animate-spin text-indigo-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-[#1e1b4b] text-white py-5 rounded-[25px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-900/20 hover:scale-[1.01] transition-all active:scale-95">
                {isEditing ? "Обновить данные" : "Создать направление"}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(null)}
                  className="px-8 bg-slate-100 text-slate-500 rounded-[25px] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 mb-6">Список активных направлений</h3>
          {directions.map((d) => (
            <div key={d.id} className="bg-white p-6 rounded-[35px] border border-white shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[25px] flex items-center justify-center overflow-hidden border border-slate-100 p-3">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} className="w-full h-full object-contain" alt={d.title} />
                  ) : (
                    <Globe size={24} className="text-slate-300"/>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase">#{d.order}</span>
                    <h3 className="font-black text-[#1e1b4b] uppercase text-sm tracking-tight">{d.title}</h3>
                  </div>
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">{d.subtitle}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setIsEditing(d.id);
                    setFormData({
                      title: d.title,
                      subtitle: d.subtitle || "",
                      href: d.href,
                      imageUrl: d.imageUrl || "",
                      order: d.order,
                      activeColor: d.activeColor || "",
                      bgColor: d.bgColor || "#F8FAFC"
                    });
                  }}
                  className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => deleteDirection(d.id)}
                  className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}