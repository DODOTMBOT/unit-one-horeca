import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  ShieldCheck, Mail, Phone, 
  MapPin, Briefcase, Settings, ExternalLink, Camera, Calendar
} from "lucide-react";
import Link from "next/link";

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) redirect("/auth/login");

  // Извлекаем только существующие в схеме поля
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      establishments: true,
      newRole: true,
    }
  });

  if (!user) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1200px] mx-auto">
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-[#1e1b4b]">Мой профиль</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Персональный кабинет системы</p>
          </div>

          <Link 
            href="/profile/edit" 
            className="flex items-center gap-2 px-6 py-3.5 bg-[#1e1b4b] text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-900/10"
          >
            <Settings size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Настройки</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* КАРТОЧКА ПОЛЬЗОВАТЕЛЯ */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="relative w-40 h-40 mx-auto mb-6 group">
                <div className="w-full h-full bg-slate-100 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
                  {user.image ? (
                    <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 font-black text-4xl uppercase">
                      {user.name?.[0]}{user.surname?.[0]}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-3 bg-white rounded-xl shadow-lg border border-slate-50 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Camera size={18} />
                </button>
              </div>

              <h2 className="text-xl font-black uppercase tracking-tight mb-2 leading-tight">
                {user.surname} <br /> {user.name}
              </h2>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-6">
                 <ShieldCheck size={12} className="text-indigo-600" />
                 <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                   {user.newRole?.name || user.role}
                 </span>
              </div>
              
              <div className="pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl text-slate-600 text-left">
                  <Phone size={14} className="shrink-0" />
                  <span className="text-[11px] font-bold">{user.phone || "Телефон не указан"}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl text-slate-600 text-left">
                  <Mail size={14} className="shrink-0" />
                  <span className="text-[11px] font-bold truncate">{user.email}</span>
                </div>
                {user.socialLink && (
                  <a href={user.socialLink} target="_blank" className="flex items-center gap-3 px-4 py-3 bg-indigo-50/50 rounded-2xl text-indigo-600 text-left">
                    <ExternalLink size={14} className="shrink-0" />
                    <span className="text-[11px] font-bold truncate">Социальные сети</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ИНФОРМАЦИЯ О РАБОТЕ */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                   <Briefcase size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Бизнес-информация</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Организация</p>
                    <p className="text-[13px] font-bold text-slate-700">{user.restaurantName || "Unit One Partner"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Формат</p>
                    <p className="text-[13px] font-bold text-slate-700">{user.restaurantFormat || "Не указан"}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Дата рождения</p>
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-slate-400" />
                       <p className="text-[13px] font-bold text-slate-700">{user.birthDate || "Не указана"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Адрес регистрации</p>
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-slate-400" />
                       <p className="text-[13px] font-bold text-slate-700">{user.restaurantAddress || "Россия"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* СПИСОК ЗАВЕДЕНИЙ (Establishments) */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                   <MapPin size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Активные объекты</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.establishments && user.establishments.length > 0 ? (
                  user.establishments.map((est) => (
                    <div key={est.id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                        <Briefcase size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-800 leading-tight">{est.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{est.city}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-8 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                    <p className="text-[11px] font-black text-slate-300 uppercase italic">За вами еще не закреплено ни одного объекта</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}