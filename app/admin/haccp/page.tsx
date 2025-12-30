import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProductsHubPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  const productLinks = [
    {
      name: "Журналы здоровья",
      href: "/admin/haccp/health",
      description: "Просмотр и управление журналами здоровья клиентов"
    },
    {
      name: "Журнал температурных режимов",
      href: "/admin/haccp/temperature",
      description: "Просмотр и управление журналами температурных режимов"
    },
    {
      name: "Категории",
      href: "/admin/products/categories",
      description: "Группировка решений и их структура"
    },
    {
      name: "Типы продуктов",
      href: "/admin/products/types",
      description: "Настройка форматов и материалов"
    },
    {
      name: "Заказы",
      href: "/admin/orders/list",
      description: "Управление заказами и их статусами"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1e1b4b] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER В СТИЛЕ ГЛАВНОГО ХАБА */}
        <div className="flex items-center justify-between mb-20">
          <div className="flex-1 flex justify-start">
            <Link 
              href="/admin" 
              className="group flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft size={20} className="text-slate-600 group-hover:text-[#7171a7]" />
            </Link>
          </div>

          <div className="px-16 py-4 bg-white border border-slate-100 rounded-[1.5rem]">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none text-center">
              Управление товарами
            </h1>
          </div>

          <div className="flex-1 hidden md:flex" />
        </div>

        {/* GRID: 4 КОЛОНКИ, КАК В ГЛАВНОМ ХАБЕ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productLinks.map((link, idx) => (
            <Link key={idx} href={link.href} className="no-underline">
              <div className="group relative h-full min-h-[180px] p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:border-[#7171a7] transition-all duration-300">
                <h3 className="text-lg font-black leading-tight mb-3 tracking-tight text-[#1e1b4b]">
                  {link.name}
                </h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed opacity-60">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-32 pt-10 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Unit One Ecosystem v.2.4</p>
          <div className="flex gap-4 items-center">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
               Режим редактирования активен
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}