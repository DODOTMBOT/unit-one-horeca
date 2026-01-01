import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  ClipboardList, 
  Thermometer, 
  Layers, 
  Tags, 
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

// Хелпер для иконок управления HACCP
const getIcon = (href: string) => {
  if (href.includes('health')) return ClipboardList;
  if (href.includes('temperature')) return Thermometer;
  if (href.includes('categories')) return Layers;
  if (href.includes('types')) return Tags;
  if (href.includes('orders')) return ShoppingBag;
  return ShieldCheck;
};

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
    <div className="flex flex-col gap-10 pb-20">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="flex items-center gap-4">
          {/* Кнопка Назад */}
          <Link 
            href="/admin" 
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-light text-[#111827] tracking-tight">
              HACCP Контроль
            </h1>
            <p className="text-gray-500 font-medium mt-2 ml-1">
              Управление журналами и параметрами системы
            </p>
          </div>
        </div>
      </div>

      {/* GRID: Bento-стиль карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productLinks.map((link, idx) => {
          const Icon = getIcon(link.href);

          return (
            <Link key={idx} href={link.href} className="no-underline group">
              <div className="relative h-64 p-8 bg-white rounded-[2.5rem] shadow-soft hover:shadow-xl border border-transparent hover:border-[#10b981] flex flex-col justify-between transition-all duration-300">
                
                {/* TOP: Иконки */}
                <div className="flex justify-between items-start">
                  {/* Основная иконка */}
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-white transition-colors duration-300">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  {/* Стрелка перехода */}
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-black group-hover:text-black transition-all">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                {/* BOTTOM: Текстовый контент */}
                <div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2 group-hover:translate-x-1 transition-transform">
                    {link.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[90%] uppercase tracking-wide">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-12 flex justify-between items-center px-4 opacity-60">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">
          Unit One Ecosystem v.2.4
        </p>
        <div className="flex gap-4 items-center">
           <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
           <span className="text-[9px] font-bold uppercase tracking-widest text-[#10b981]">
             Система готова к работе
           </span>
        </div>
      </div>
    </div>
  );
}