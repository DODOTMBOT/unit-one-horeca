"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit2, ImageIcon, Loader2, 
  Globe, ArrowLeft, LogOut, GripVertical, CheckCircle2, XCircle
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
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-[#10b981]" size={32} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER: Вернуться назад + Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Экосистема</h1>
            <p className="text-sm text-gray-500">Управление направлениями платформы</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-soft sticky top-24">
          <h2 className="text-lg font-bold text-[#111827] mb-6">
            {isEditing ? "Редактирование" : "Новое направление"}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Image Upload */}
            <div className="flex justify-center">
               <div className="relative group w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#10b981] transition-colors cursor-pointer">
                  {formData.imageUrl ? (
                    <div className="relative w-full h-full p-4">
                       <Image src={formData.imageUrl} alt="Preview" fill className="object-contain" />
                    </div>
                  ) : (
                    <ImageIcon className="text-gray-300 group-hover:text-[#10b981]" size={24} />
                  )}
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-[#10b981]" /></div>}
               </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Название (ID)</label>
                <input 
                  className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-3 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-gray-400" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Напр. HUNTER"
                  required 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Заголовок (RU)</label>
                <input 
                  className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-3 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-gray-400" 
                  value={formData.subtitle} 
                  onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                  placeholder="Напр. Менеджер офиса"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Ссылка</label>
                  <input 
                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-3 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-gray-400" 
                    value={formData.href} 
                    onChange={e => setFormData({...formData, href: e.target.value})} 
                    placeholder="/path"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Sort</label>
                  <input 
                    type="number"
                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#10b981] rounded-xl px-4 py-3 text-sm font-medium text-[#111827] outline-none transition-all text-center" 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div 
              onClick={() => setFormData(p => ({...p, isComingSoon: !p.isComingSoon}))}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${formData.isComingSoon ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
            >
              <span className={`text-xs font-bold uppercase tracking-wide ${formData.isComingSoon ? 'text-amber-700' : 'text-gray-500'}`}>
                Статус "Скоро"
              </span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.isComingSoon ? 'bg-amber-500 text-white' : 'bg-gray-300'}`}>
                {formData.isComingSoon && <CheckCircle2 size={12} />}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(null); setFormData(initialForm); }} 
                  className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
              )}
              <button 
                type="submit" 
                className="flex-1 px-6 py-3 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/20"
              >
                {isEditing ? "Сохранить" : "Создать"}
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: LIST */}
        <div className="xl:col-span-2 space-y-4">
          {directions.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center shadow-soft">
              <p className="text-gray-400 font-medium">Список пока пуст</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {directions.sort((a,b) => a.order - b.order).map((d, i) => (
                <div 
                  key={d.id} 
                  className={`
                    group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors
                    ${i !== directions.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                >
                  {/* Info */}
                  <div className="flex items-center gap-4">
                    <div className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 p-2">
                      <GripVertical size={16} />
                    </div>
                    
                    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2">
                      {d.imageUrl ? (
                        <Image src={d.imageUrl} width={32} height={32} alt="" className="object-contain" />
                      ) : (
                        <Globe size={20} className="text-gray-300" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#111827]">{d.subtitle}</span>
                        {d.isComingSoon && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-600">Soon</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span className="font-mono bg-gray-100 px-1.5 rounded text-gray-500">#{d.order}</span>
                        <span>{d.title}</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-mono">{d.href}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setIsEditing(d.id); setFormData({...d, subtitle: d.subtitle || ""}); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#10b981] hover:bg-[#ecfdf5] transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteDirection(d.id)} 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}