import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function PartnerHub() {
  const session = await getServerSession(authOptions);
  
  const modules = [
    { name: "Мои заведения", info: "Редактирование, создание и список объектов", href: "/partner/establishments" },
    { name: "Сотрудники", info: "Управление штатом и ролями", href: "/partner/staff" },
    { name: "Оборудование", info: "Учет технического парка", href: "/partner/equipment" },
    { name: "Журналы HACCP", info: "Контроль здоровья и температур", href: "/partner/haccp" },
    { name: "Чек-листы", info: "Плановые проверки", href: "#", isSoon: true },
    { name: "Аналитика", info: "Отчеты по эффективности", href: "#", isSoon: true },
    { name: "База знаний", info: "Стандарты и инструкции", href: "#", isSoon: true },
  ];

  return (
    <div 
      data-page="partner-terminal" 
      className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12"
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP INTERFACE BAR */}
        <div className="flex items-center justify-between mb-20">
          
          {/* Левый пустой блок для центровки */}
          <div className="flex-1 hidden md:flex justify-start" />

          {/* ЦЕНТРАЛЬНЫЙ БЛОК (ДЛИННЫЙ И УЗКИЙ) */}
          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
              Панель партнёра
            </h1>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: КНОПКИ УПРАВЛЕНИЯ */}
          <div className="flex-1 flex items-center justify-end gap-2">
            {/* Кнопка ГЛАВНАЯ */}
            <Link 
              href="/" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50"
            >
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">Главная</p>
            </Link>

            {/* Кнопка ПРОФИЛЬ */}
            <Link 
              href="/profile" 
              className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] transition-colors hover:bg-slate-50"
            >
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">
                {session?.user?.name || "Эмиль"}
              </p>
            </Link>

            {/* Кнопка ВЫХОД */}
            <Link 
              href="/" 
              className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
              title="Выйти"
            >
              <LogOut size={18} />
            </Link>
          </div>
        </div>

        {/* GRID MODULES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, idx) => {
            const isSoon = module.isSoon;
            const CardContent = (
              <div className={`group relative h-full min-h-[160px] p-8 rounded-[2rem] border transition-colors ${
                isSoon 
                ? "bg-slate-100/30 border-transparent opacity-40 cursor-not-allowed" 
                : "bg-white border-slate-100 hover:border-indigo-200"
              }`}>
                <div>
                  <h3 className={`text-xl font-black leading-tight mb-3 tracking-tight ${isSoon ? 'text-slate-400' : 'text-[#1e1b4b]'}`}>
                    {module.name}
                  </h3>
                  <p className="text-[13px] font-medium text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                    {module.info}
                  </p>
                </div>

                {isSoon && (
                  <div className="mt-auto pt-4">
                     <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-full">
                       В разработке
                     </div>
                  </div>
                )}
              </div>
            );

            return isSoon ? (
              <div key={idx}>{CardContent}</div>
            ) : (
              <Link key={idx} href={module.href} className="no-underline">
                {CardContent}
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-32 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="opacity-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Unit One Ecosystem v.2.4</p>
          </div>
          <div className="flex gap-12">
            {["Поддержка", "Регламенты", "API"].map((item) => (
              <span key={item} className="text-[10px] font-black uppercase tracking-widest text-slate-200 hover:text-indigo-600 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}