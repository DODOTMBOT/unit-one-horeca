"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/checklists/my-pending");
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (error) {
        toast.error("Ошибка загрузки задач");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const getTimeRemaining = (deadline: string) => {
    const total = Date.parse(deadline) - Date.parse(new Date().toString());
    if (total <= 0) return "Срок истек";
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
          Мои задачи
        </h1>
        <p className="text-slate-500 text-sm">Список чек-листов, ожидающих заполнения</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-100" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={32} />
          </div>
          <h3 className="font-bold text-slate-800">Все задачи выполнены!</h3>
          <p className="text-slate-500 text-sm">На сегодня активных чек-листов нет.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isOverdue = new Date(task.deadline) < new Date();
            
            return (
              <Link 
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block group bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Clock size={16} />
                      </div>
                      <span className={`text-xs font-black uppercase ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                        {isOverdue ? 'Просрочено' : `До дедлайна: ${getTimeRemaining(task.deadline)}`}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-800 text-lg uppercase leading-tight group-hover:text-indigo-600 transition-colors">
                        {task.template.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <MapPin size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {task.establishment.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={24} />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {task.template.items.slice(0, 3).map((_: any, i: number) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                        {i + 1}
                      </div>
                    ))}
                    {task.template.items.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                        +{task.template.items.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {task.template.items.length} этапов
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}