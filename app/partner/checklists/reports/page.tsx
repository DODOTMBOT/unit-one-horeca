"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Camera,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ChecklistReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/checklists/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (error) {
        toast.error("Ошибка загрузки отчетов");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse uppercase font-black text-xs text-slate-400">Загрузка журнала...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Журнал проверок</h1>
        <p className="text-slate-500 text-sm">История выполнения чек-листов по всем заведениям</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
          <p className="text-slate-400 font-bold uppercase text-xs">Завершенных отчетов пока нет</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Header карточки */}
              <div 
                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase leading-tight">{report.template.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <MapPin size={12} /> {report.establishment.name}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <User size={12} /> {report.employee.name} {report.employee.surname}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-300 uppercase">Дата выполнения</div>
                    <div className="text-xs font-bold text-slate-700">
                      {new Date(report.completedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {expandedId === report.id ? <ChevronUp className="text-slate-300" /> : <ChevronDown className="text-slate-300" />}
                </div>
              </div>

              {/* Тело карточки (Развернуто) */}
              {expandedId === report.id && (
                <div className="px-8 pb-8 pt-2 border-t border-slate-50 bg-slate-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {report.responses.map((resp: any) => (
                      <div key={resp.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-bold text-slate-700 leading-snug">{resp.item.taskText}</p>
                        </div>
                        
                        {resp.photoUrl && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                            <img src={resp.photoUrl} alt="Proof" className="object-cover w-full h-full cursor-zoom-in" onClick={() => window.open(resp.photoUrl, '_blank')} />
                            <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={12} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}