"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  ClipboardList, 
  Calendar, 
  Clock, 
  UserPlus, 
  MoreVertical,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ChecklistsListPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/checklists/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      toast.error("Не удалось загрузить шаблоны");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Шаблоны чек-листов
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Управляйте структурой проверок и назначайте их персоналу
          </p>
        </div>
        
        <Link 
          href="/partner/office/checklists/new"
          className="flex items-center justify-center gap-2 bg-[#a3e635] text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_8px_20px_rgba(163,230,53,0.3)] hover:scale-105 transition-all"
        >
          <Plus size={20} /> Создать шаблон
        </Link>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 border border-dashed border-slate-300 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <ClipboardList size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Шаблонов пока нет</h3>
            <p className="text-slate-500 text-sm">Создайте свой первый чек-лист, чтобы начать контроль</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className="group bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ClipboardList size={24} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight uppercase">
                    {template.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                      {template.items.length} пунктов
                    </span>
                    {template.isPermanent ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <Clock size={12} /> Вечный
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                        <Calendar size={12} /> До {new Date(template.validUntil).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex gap-3">
                <Link 
                  href={`/partner/office/checklists/assign?templateId=${template.id}`}
                  className="flex-1 bg-slate-900 text-white h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                >
                  <UserPlus size={16} /> Назначить
                </Link>
                <Link 
                  href={`/partner/office/checklists/edit/${template.id}`}
                  className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all"
                >
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}