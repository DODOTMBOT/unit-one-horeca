"use client";

import { useEffect, useState, use } from "react"; // Добавили 'use'
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle2, 
  Circle, 
  Send,
  Loader2,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ChecklistExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // В Next.js 15 params нужно разворачивать через use() или await
  const { id } = use(params);

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/checklists/assignments/${id}`);
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Ошибка");
        }

        const data = await res.json();
        setTask(data);
        
        const initialResponses: Record<string, any> = {};
        data.template.items.forEach((item: any) => {
          initialResponses[item.id] = { isCompleted: false, photoUrl: null };
        });
        setResponses(initialResponses);
      } catch (error: any) {
        toast.error(error.message || "Задача не найдена");
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const toggleItem = (itemId: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], isCompleted: !prev[itemId].isCompleted }
    }));
  };

  const handlePhotoUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const t = toast.loading("Загрузка фото...");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (res.ok && data.url) {
        setResponses(prev => ({
          ...prev,
          [itemId]: { ...prev[itemId], photoUrl: data.url, isCompleted: true }
        }));
        toast.success("Фото загружено", { id: t });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Ошибка загрузки", { id: t });
    }
  };

  const handleSubmit = async () => {
    const incomplete = task.template.items.find((item: any) => !responses[item.id].isCompleted);
    if (incomplete) return toast.error(`Выполните: ${incomplete.taskText}`);

    setSubmitting(true);
    try {
      const res = await fetch(`/api/checklists/assignments/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          responses: Object.entries(responses).map(([itemId, val]) => ({ 
            itemId, 
            ...val 
          })) 
        })
      });

      if (res.ok) {
        toast.success("Отчет отправлен!");
        router.push("/tasks");
        router.refresh();
      } else {
        toast.error("Ошибка сохранения");
      }
    } catch (error) {
      toast.error("Ошибка при отправке");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-400 font-bold uppercase text-[10px]">Загрузка...</p>
    </div>
  );

  if (!task) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-6">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-2xl font-bold">!</div>
      <h2 className="text-lg font-black uppercase text-slate-800">Задача не найдена</h2>
      <button onClick={() => router.push('/tasks')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase">К списку задач</button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/tasks')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-black uppercase text-slate-800 tracking-tight">{task.template.title}</h1>
          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{task.establishment.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        {task.template.items.map((item: any) => {
          const resp = responses[item.id];
          return (
            <div key={item.id} className={`bg-white rounded-[2rem] p-6 border-2 transition-all ${resp?.isCompleted ? 'border-emerald-500/20 bg-emerald-50/5' : 'border-transparent shadow-sm'}`}>
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => item.type === 'SIMPLE' && toggleItem(item.id)}
                  className={`mt-1 transition-colors ${resp?.isCompleted ? 'text-emerald-500' : 'text-slate-200'}`}
                >
                  {resp?.isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                <div className="flex-1">
                  <p className={`font-bold text-lg ${resp?.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.taskText}</p>
                  {item.type === 'PHOTO' && !resp?.photoUrl && (
                    <label className="mt-4 flex flex-col items-center py-8 bg-slate-50 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-slate-100 transition-all">
                      <Camera className="text-slate-400 mb-2" size={24} />
                      <span className="text-[10px] font-black uppercase text-slate-400">Сделать фото</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoUpload(item.id, e)} />
                    </label>
                  )}
                  {resp?.photoUrl && (
                    <div className="mt-4 relative rounded-2xl overflow-hidden shadow-md">
                      <img src={resp.photoUrl} alt="Report" className="w-full h-48 object-cover" />
                      <button onClick={() => setResponses(prev => ({...prev, [item.id]: { ...prev[item.id], photoUrl: null, isCompleted: false }}))} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full"><X size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-50">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full max-w-sm bg-slate-900 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Завершить отчет</>}
        </button>
      </div>
    </div>
  );
}