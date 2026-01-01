import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PartnerOfficeHub() {
  const session = await getServerSession(authOptions);
  
  const isSuperAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  
  // Приводим все права к нижнему регистру и убираем пробелы
  const userPermissions = (session?.user?.permissions || []).map(p => p.trim().toLowerCase());

  const modules = [
    { 
      name: "Сотрудники", 
      info: "Управление штатом и ролями", 
      href: "/partner/office/staff" 
    },
    { 
      name: "Рестораны", 
      info: "Редактирование, создание и список объектов", 
      href: "/partner/office/establishments" 
    },
    { 
      name: "Оборудование", 
      info: "Редактирование, создание и список объектов", 
      href: "/partner/office/equipment" 
    },
    { name: "База знаний", info: "Стандарты и инструкции", href: "#", isSoon: true },
  ];

  const visibleModules = modules.filter(module => {
    // 1. Модули в разработке показываем (или скрываем, как хотите)
    if (module.isSoon) return true;
    
    // 2. Супер-админ видит всё
    if (isSuperAdmin) return true;

    const targetPath = module.href.toLowerCase();
    
    // 3. СТРОГАЯ ПРОВЕРКА:
    // Мы ищем ТОЧНОЕ совпадение пути.
    // Наличие прав на родителя (/partner/office) НЕ дает права видеть карточку ребенка.
    return userPermissions.includes(targetPath);
  });

  return (
    <div data-page="partner-terminal" className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex items-center justify-between mb-20">
          <div className="flex-1 flex justify-start">
            <Link href="/partner" className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <ArrowLeft size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-800">Назад</p>
            </Link>
          </div>
          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 text-center">Менеджер офиса</h1>
          </div>
          <div className="flex-1 flex items-center justify-end gap-2">
            <Link href="/api/auth/signout" className="w-12 h-12 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        {/* СЕТКА МОДУЛЕЙ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleModules.map((module, idx) => (
            module.isSoon ? (
              <div key={idx} className="group relative h-full min-h-[160px] p-8 rounded-[2rem] border bg-slate-100/30 opacity-40 cursor-not-allowed">
                <h3 className="text-xl font-black mb-3 text-slate-400">{module.name}</h3>
                <p className="text-[13px] font-medium text-slate-400">{module.info}</p>
                <div className="mt-4 text-[8px] font-black uppercase text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-full">В разработке</div>
              </div>
            ) : (
              <Link key={idx} href={module.href} className="no-underline">
                <div className="group relative h-full min-h-[160px] p-8 rounded-[2rem] border bg-white border-slate-100 hover:border-indigo-500 transition-all duration-300 shadow-sm">
                  <h3 className="text-xl font-black mb-3 text-[#1e1b4b]">{module.name}</h3>
                  <p className="text-[13px] font-medium text-slate-400 group-hover:text-slate-500">{module.info}</p>
                </div>
              </Link>
            )
          ))}
        </div>

        {/* --- ОТЛАДОЧНЫЙ БЛОК (УДАЛИТЬ ПОТОМ) --- */}
        <div className="mt-20 p-6 bg-slate-900 text-slate-400 rounded-xl text-xs font-mono">
           <p className="font-bold text-white mb-2">DEBUG INFO (ВИДИТ ТОЛЬКО РАЗРАБОТЧИК)</p>
           <p>Ваша роль: <span className="text-yellow-400">{session?.user?.role}</span></p>
           <p className="mt-2">Ваши права (из базы):</p>
           <ul className="list-disc pl-4 mt-1 space-y-1">
             {userPermissions.map(p => (
               <li key={p} className={
                 modules.some(m => m.href.toLowerCase() === p) ? "text-green-400" : "text-slate-500"
               }>
                 {p}
               </li>
             ))}
           </ul>
        </div>
        {/* --------------------------------------- */}

      </div>
    </div>
  );
}