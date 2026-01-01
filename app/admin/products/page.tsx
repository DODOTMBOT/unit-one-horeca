import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, Plus, Edit, Layers, 
  Tags, ShoppingBag, ArrowUpRight, Package 
} from "lucide-react";

// Хелпер для иконок
const getIcon = (href: string) => {
  if (href.includes('create')) return Plus;
  if (href.includes('manage')) return Edit;
  if (href.includes('categories')) return Layers;
  if (href.includes('types')) return Tags;
  if (href.includes('orders')) return ShoppingBag;
  return Package;
};

export default async function ProductsHubPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  const productLinks = [
    {
      name: "Добавить продукт",
      href: "/admin/products/create",
      description: "Создание новой карточки, загрузка фото и цен"
    },
    {
      name: "Редакция каталога",
      href: "/admin/products/manage",
      description: "Управление всеми товарами и их удаление"
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
              Маркетплейс
            </h1>
            <p className="text-gray-500 font-medium mt-2 ml-1">
              Управление каталогом и продажами
            </p>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productLinks.map((link, idx) => {
          const Icon = getIcon(link.href);

          return (
            <Link key={idx} href={link.href} className="no-underline group">
              <div className="relative h-64 p-8 bg-white rounded-[2.5rem] shadow-soft hover:shadow-xl border border-transparent hover:border-[#10b981] flex flex-col justify-between transition-all duration-300">
                
                {/* TOP: Icons */}
                <div className="flex justify-between items-start">
                  {/* Main Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-white transition-colors duration-300">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-black group-hover:text-black transition-all">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                {/* BOTTOM: Text */}
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
    </div>
  );
}