import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  ShieldCheck, Mail, Phone, 
  MapPin, Briefcase, FileText, Printer, Edit3, ArrowLeft // Добавлен ArrowLeft для иконок внизу
} from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton"; // Импорт новой кнопки

export default async function AdminStaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      establishments: true,
      parentPartner: true,
    }
  }) as any;

  if (!user) notFound();

  return (
    <div data-page="partner-terminal" className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1200px] mx-auto">
        
        {/* HEADER BAR */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex-1">
            {/* ИСПОЛЬЗОВАНИЕ КЛИЕНТСКОЙ КНОПКИ НАЗАД */}
            <BackButton />
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Работает</span>
             </div>
             <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                <Edit3 size={18} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="w-40 h-40 bg-slate-100 rounded-[2.5rem] mx-auto mb-6 overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
                {user.image ? (
                  <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-300 font-black text-4xl uppercase">
                    {user.name?.[0]}{user.surname?.[0]}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2 leading-tight">
                {user.surname} <br /> {user.name} {user.patronymic || ""}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
                {user.role === 'MANAGER' ? 'Управляющий' : 'Линейный персонал'}
              </p>
              
              <div className="pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl text-slate-600">
                  <Phone size={14} />
                  <span className="text-[11px] font-bold">{user.phone || "Телефон не указан"}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl text-slate-600">
                  <Mail size={14} />
                  <span className="text-[11px] font-bold truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                   <FileText size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Рабочая информация</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Мед. книжка до</p>
                    <p className="text-[13px] font-bold text-slate-700">{user.medCardDate || "Не указано"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Дата приема</p>
                    <p className="text-[13px] font-bold text-slate-700">{user.hireDate || "02.11.2025"}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">ИНН / ПФР</p>
                    <p className="text-[13px] font-bold text-slate-700">{user.inn || "—"} / {user.pfr || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Штрих-код</p>
                    <button className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 transition-colors">
                      <Printer size={14} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Распечатать</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                   <MapPin size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Объекты доступа</h3>
              </div>

              <div className="space-y-3">
                {user.establishments && user.establishments.length > 0 ? (
                  user.establishments.map((est: any) => (
                    <div key={est.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-slate-800">{est.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{est.city}</p>
                        </div>
                      </div>
                      {/* Ссылка на объект остается прямой, так как это переход вглубь системы */}
                      <Link href={`/partner/establishments/${est.id}`} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-indigo-500 transition-all">
                        <ArrowLeft size={16} className="rotate-180" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] font-black text-slate-300 uppercase italic">Сотрудник не закреплен за объектами</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}