import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default async function PartnerHub() {
  const session = await getServerSession(authOptions);
  
  const modules = [
    { name: "Сотрудники", info: "Управление штатом, ролями и доступами на объекте", href: "/partner/establishments/${id}/staff" },
    { name: "Оборудование", info: "Технический парк, мониторинг температур и инвентарь", href: "/partner/establishments/${id}/equipment" },
    { name: "Журнал здоровья", info: "Ежедневный цифровой учет HACCP и журналы здоровья", href: "/partner/establishments/${id}/health" },
    { name: "Чек-листы", info: "Плановые проверки", href: "#", isSoon: true },
    { name: "Чек-листы", info: "Плановые проверки", href: "#", isSoon: true },
    { name: "Чек-листы", info: "Плановые проверки", href: "#", isSoon: true },
    { name: "Аналитика", info: "Отчеты по эффективности", href: "#", isSoon: true },
    { name: "База знаний", info: "Стандарты и инструкции", href: "#", isSoon: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b]">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
               <LayoutGrid size={20} className="text-white" />
            </div>
            <div>
               <h1 className="text-xl font-black tracking-tight leading-none">HoReCa.Solutions</h1>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner Terminal</span>
            </div>
          </div>
          
          <Link href="/" className="group flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-rose-50 rounded-full transition-all">
            <ArrowLeft size={16} className="text-slate-500 group-hover:text-rose-600 transition-colors" />
            <span className="text-sm font-bold text-slate-600 group-hover:text-rose-600 transition-colors">Выйти</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, idx) => {
            const isSoon = module.isSoon;
            const CardContent = (
              <div className={`group relative h-full min-h-[180px] p-8 rounded-[2rem] transition-all duration-300 border flex flex-col justify-start ${
                isSoon 
                ? "bg-slate-200/40 border-transparent opacity-60 cursor-not-allowed" 
                : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:z-10"
              }`}>
                <div>
                  <h3 className={`text-2xl font-black leading-tight mb-3 ${isSoon ? 'text-slate-400' : 'text-[#1e1b4b]'}`}>
                    {module.name}
                  </h3>
                  <p className="text-[14px] font-medium text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                    {module.info}
                  </p>
                </div>

                {isSoon && (
                  <div className="mt-auto pt-4">
                     <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 w-fit px-3 py-1 rounded-full">
                       В разработке
                     </div>
                  </div>
                )}
              </div>
            );

            return isSoon ? (
              <div key={idx}>{CardContent}</div>
            ) : (
              <Link key={idx} href={module.href}>
                {CardContent}
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-30">
            <LayoutGrid size={16} />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]">Unit One Ecosystem v.2.4</p>
          </div>
          <div className="flex gap-8">
            {["Поддержка", "Регламенты", "API"].map((item) => (
              <span key={item} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}