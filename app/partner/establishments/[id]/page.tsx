import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  ShieldCheck, MapPin, Users, HardDrive, 
  Clock, ExternalLink, Edit3, Info, ClipboardList, 
  Thermometer, LayoutGrid 
} from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";



export default async function AdminEstablishmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;

  if (!id) notFound();

  const est = await prisma.establishment.findUnique({
    where: { id },
    include: {
      owner: true,
      employees: true,
      equipment: true,
      _count: {
        select: {
          healthLogs: true,
          tempLogs: true,
        }
      }
    }
  });

  if (!est) notFound();

  return (
    <div data-page="partner-terminal" className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        <header className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <BackButton />
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Объект в сети</span>
             </div>
             <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                <Edit3 size={18} />
             </button>
          </div>
        </header>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-indigo-50 rounded-[2.2rem] flex items-center justify-center text-indigo-500 border border-indigo-100/50 shadow-inner">
                    <ShieldCheck size={44} />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{est.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100/50">
                            <MapPin size={14} className="text-indigo-500" />
                            <span className="text-[11px] font-bold uppercase tracking-tight">{est.city}, {est.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100/50">
                            <Clock size={14} className="text-amber-500" />
                            <span className="text-[11px] font-bold uppercase tracking-tight">Создан: {new Date(est.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 min-w-[200px]">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Владелец</p>
                    <p className="text-xs font-black uppercase tracking-tight text-slate-700">{est.owner?.name} {est.owner?.surname}</p>
                </div>
                <div className="bg-[#1e1b4b] p-6 rounded-[2rem] text-white min-w-[220px] shadow-lg shadow-indigo-900/20">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Invite Code</p>
                    <div className="text-2xl font-mono font-black tracking-[0.2em] leading-none">
                        {est.inviteCode || "— — —"}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
                            <Users size={24} />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-[#1e1b4b]">Штат сотрудников <span className="text-slate-300 ml-1 font-bold">{est.employees.length}</span></h2>
                    </div>
                </div>

                <div className="space-y-4">
                    {est.employees.map((staff: any) => (
                        <div key={staff.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-[10px] text-slate-300 border border-slate-100">
                                    {staff.name?.[0]}{staff.surname?.[0]}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight text-[#1e1b4b]">{staff.name} {staff.surname}</p>
                                    <p className="text-[10px] font-bold text-slate-400 tracking-tight">{staff.role}</p>
                                </div>
                            </div>
                            <Link href={`/partner/profile/${staff.id}`} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-indigo-600 transition-all shadow-sm">
                                <ExternalLink size={14} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                            <HardDrive size={24} />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-[#1e1b4b]">Оборудование <span className="text-slate-300 ml-1 font-bold">{est.equipment.length}</span></h2>
                    </div>
                </div>

                <div className="space-y-4">
                    {est.equipment.map((eq: any) => (
                        <div key={eq.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
                                    <Info size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight text-[#1e1b4b]">{eq.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{eq.type}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-24 pt-10 border-t border-slate-100 flex justify-between items-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 flex items-center gap-2">
              <LayoutGrid size={12} /> Unit One Ecosystem
            </p>
        </div>
      </div>
    </div>
  );
}