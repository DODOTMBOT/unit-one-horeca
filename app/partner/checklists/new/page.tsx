"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Camera, 
  CheckSquare, 
  Calendar,
  Clock
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type ItemType = "SIMPLE" | "PHOTO";

interface ChecklistItem {
  id: string;
  taskText: string;
  type: ItemType;
}

export default function NewChecklistPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isPermanent, setIsPermanent] = useState(true);
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: crypto.randomUUID(), taskText: "", type: "SIMPLE" }
  ]);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), taskText: "", type: "SIMPLE" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ChecklistItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Введите название чек-листа");
    if (items.some(i => !i.taskText.trim())) return toast.error("Заполните все пункты");

    setLoading(true);
    try {
      const res = await fetch("/api/checklists/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          isPermanent,
          validUntil: isPermanent ? null : validUntil,
          items: items.map((item, index) => ({
            taskText: item.taskText,
            type: item.type,
            order: index
          }))
        })
      });

      if (res.ok) {
        toast.success("Чек-лист создан!");
        router.push("/partner/office/checklists");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/partner/office/checklists" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-slate-500" />
            </Link>
            <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Новый чек-лист</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? "Сохранение..." : <><Save size={18} /> Сохранить</>}
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Basic Info */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Название шаблона</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Открытие смены кухни"
                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-slate-800 font-bold focus:ring-2 ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Актуальность</label>
              <div className="flex items-center gap-4 h-14">
                <button 
                  onClick={() => setIsPermanent(true)}
                  className={`flex-1 h-full rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs ${isPermanent ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                >
                  <Clock size={16} /> Вечный
                </button>
                <button 
                  onClick={() => setIsPermanent(false)}
                  className={`flex-1 h-full rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs ${!isPermanent ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                >
                  <Calendar size={16} /> До даты
                </button>
              </div>
            </div>

            {!isPermanent && (
              <div className="md:col-start-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Срок действия до</label>
                <input 
                  type="date" 
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-slate-800 font-bold focus:ring-2 ring-indigo-500 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Пункты проверки</h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{items.length} задач(и)</span>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="group bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200 flex gap-6 items-start animate-in fade-in slide-in-from-bottom-2">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-300 border border-slate-100">
                {index + 1}
              </div>
              
              <div className="flex-1 space-y-4">
                <input 
                  type="text" 
                  value={item.taskText}
                  onChange={(e) => updateItem(item.id, "taskText", e.target.value)}
                  placeholder="Что нужно проверить?"
                  className="w-full bg-transparent border-none p-0 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-0 text-lg"
                />
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateItem(item.id, "type", "SIMPLE")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${item.type === 'SIMPLE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    <CheckSquare size={14} /> Галочка
                  </button>
                  <button 
                    onClick={() => updateItem(item.id, "type", "PHOTO")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${item.type === 'PHOTO' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    <Camera size={14} /> Фото-отчет
                  </button>
                </div>
              </div>

              <button 
                onClick={() => removeItem(item.id)}
                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <button 
            onClick={addItem}
            className="w-full py-6 rounded-[1.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Добавить пункт
          </button>
        </div>
      </main>
    </div>
  );
}