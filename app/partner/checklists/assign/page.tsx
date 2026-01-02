"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Store, 
  Users, 
  Calendar, 
  Send,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

function AssignChecklistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("18:00");

  // 1. Загружаем доступные заведения из нашего нового API
  useEffect(() => {
    const loadEst = async () => {
      try {
        const res = await fetch("/api/establishments");
        if (res.ok) {
          const data = await res.json();
          setEstablishments(data);
        }
      } catch (error) {
        console.error("Failed to load establishments");
      }
    };
    loadEst();
  }, []);

  // 2. Загружаем сотрудников, когда выбрано заведение
  useEffect(() => {
    if (selectedEst) {
      const fetchEmployees = async () => {
        try {
          const res = await fetch(`/api/partner/haccp/staff/${selectedEst}`);
          if (res.ok) {
            const data = await res.json();
            setEmployees(data);
            setSelectedEmployees([]); // Сбрасываем выбор при смене рестика
          }
        } catch (error) {
          toast.error("Ошибка загрузки персонала");
        }
      };
      fetchEmployees();
    } else {
      setEmployees([]);
    }
  }, [selectedEst]);

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!templateId) return toast.error("Шаблон не найден");
    if (!selectedEst) return toast.error("Выберите заведение");
    if (selectedEmployees.length === 0) return toast.error("Выберите сотрудников");
    if (!deadline) return toast.error("Установите дату");

    setLoading(true);
    try {
      const res = await fetch("/api/checklists/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          establishmentId: selectedEst,
          employeeIds: selectedEmployees,
          deadline: `${deadline}T${deadlineTime}:00.000Z`, 
        })
      });

      // Безопасно пытаемся распарсить JSON, чтобы не получить HTML ошибку в тост
      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success("Назначено успешно!");
        router.push("/partner/office/checklists");
        router.refresh();
      } else {
        // Если API вернул 404 или 500, выводим внятное сообщение
        toast.error(data?.error || `Ошибка сервера (${res.status})`);
        console.error("Assign error details:", data);
      }
    } catch (error: any) {
      toast.error("Сетевая ошибка или сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/partner/office/checklists" className="p-2 hover:bg-white rounded-xl transition-all">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">Назначение чек-листа</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Блок выбора заведения */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 text-indigo-600">
              <Store size={20} />
              <h2 className="font-bold text-slate-800 text-lg">Где проводим проверку?</h2>
            </div>
            
            <select 
              value={selectedEst}
              onChange={(e) => setSelectedEst(e.target.value)}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-slate-800 font-bold focus:ring-2 ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="">Выберите ресторан...</option>
              {establishments.map(est => (
                <option key={est.id} value={est.id}>{est.name}</option>
              ))}
            </select>
          </div>

          {/* Блок выбора сотрудников */}
          <div className={`bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 transition-all ${!selectedEst ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <Users size={20} />
                <h2 className="font-bold text-slate-800 text-lg">Исполнители</h2>
              </div>
              {employees.length > 0 && (
                <button 
                  onClick={() => setSelectedEmployees(employees.map(e => e.id))}
                  className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Выбрать всех
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {employees.length > 0 ? employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => toggleEmployee(emp.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedEmployees.includes(emp.id) 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-slate-800">{emp.name} {emp.surname}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                      {emp.newRole?.name || 'Персонал'}
                    </div>
                  </div>
                  {selectedEmployees.includes(emp.id) && <CheckCircle2 size={18} className="text-indigo-600" />}
                </button>
              )) : (
                <div className="col-span-2 text-center py-6 text-slate-400 text-sm italic">
                  {selectedEst ? "В этом заведении нет сотрудников" : "Сначала выберите заведение выше"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Правая колонка: Дедлайн */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 sticky top-24">
            <div className="flex items-center gap-3 mb-6 text-amber-500">
              <Clock size={20} />
              <h2 className="font-bold text-slate-800 text-lg">Срок</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Дата выполнения</label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-slate-800 font-bold focus:ring-2 ring-indigo-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Время (до скольки)</label>
                <input 
                  type="time" 
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-slate-800 font-bold focus:ring-2 ring-indigo-500 mt-1"
                />
              </div>
            </div>

            <button
              onClick={handleAssign}
              disabled={loading || !selectedEst || selectedEmployees.length === 0}
              className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-xl shadow-slate-200"
            >
              {loading ? "Обработка..." : <><Send size={16} /> Назначить</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssignChecklistPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold animate-pulse text-slate-400 uppercase tracking-widest text-xs">Загрузка интерфейса назначения...</div>}>
      <AssignChecklistContent />
    </Suspense>
  );
}