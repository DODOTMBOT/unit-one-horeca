import { prisma } from '@/lib/prisma';
import ProfileAlert from "@/components/ProfileAlert";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

const badgePalette: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-600",
  black: "bg-black text-white",
  red: "bg-red-500 text-white",
  green: "bg-emerald-500 text-white",
  indigo: "bg-indigo-500 text-white",
  orange: "bg-orange-500 text-white",
};

export default async function Home({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.minPrice || params.maxPrice ? {
        price: {
          ...(params.minPrice ? { gte: Number(params.minPrice) } : {}),
          ...(params.maxPrice ? { lte: Number(params.maxPrice) } : {}),
        }
      } : {})
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="bg-white min-h-full flex flex-col">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex-1 pb-32">
        <div className="pt-8">
          <ProfileAlert />
        </div>

        <div className="mt-20 mb-20 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block">
              Marketplace
            </span>
            <h2 className="text-7xl font-black uppercase tracking-tighter text-[#1e1b4b]">
              Решения
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-[13px] font-black text-[#1e1b4b] uppercase tracking-widest">
              {products.length} позиции
            </span>
            <div className="h-1.5 w-24 bg-indigo-500 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-24">
          {products.map((product: any) => {
            return (
              <div 
                key={product.id} 
                className="group relative flex flex-col h-full text-left"
              >
                {/* НЕВИДИМАЯ ССЫЛКА ПОВЕРХ ВСЕЙ КАРТОЧКИ */}
                <Link 
                  href={`/checkout/${product.id}`} 
                  className="absolute inset-0 z-20 shadow-none outline-none"
                  aria-label={product.title}
                />

                <div 
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-[60px] mb-8 transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(30,27,75,0.15)] group-hover:-translate-y-2"
                  style={{ backgroundColor: product.bgColor || '#F8FAFC' }}
                >
                  {product.badgeText && (
                    <div className="absolute top-8 left-8 z-10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-white/20 text-white backdrop-blur-md border border-white/20">
                      {product.badgeText}
                    </div>
                  )}

                  {product.imageUrl && (
                    <div className="relative w-full h-full p-10 transition-transform duration-700 group-hover:scale-105">
                      <Image 
                        src={product.imageUrl} 
                        alt={product.title} 
                        fill 
                        className="object-contain p-6" 
                      />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                <div className="flex flex-col flex-1 px-4">
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${badgePalette[product.category?.badgeColor] || badgePalette.indigo}`}>
                      {product.category?.name || 'Solution'}
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-100" />
                  </div>

                  <h3 className="text-[22px] font-black text-[#1e1b4b] leading-[1.1] mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 uppercase tracking-tight">
                    {product.title}
                  </h3>
                  
                  <p className="text-[14px] text-slate-400 leading-relaxed mb-4 line-clamp-5 font-bold uppercase tracking-wide opacity-70">
                    {product.shortDescription || "Детальное описание продукта готовится"}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Стоимость</span>
                        <span className="text-[28px] font-black text-[#1e1b4b] tracking-tighter leading-none">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      
                      <div className="relative z-10 w-16 h-16 rounded-[24px] bg-[#1e1b4b] flex items-center justify-center text-white shadow-xl shadow-indigo-900/10 transition-all duration-500 transform group-hover:rotate-[-45deg] group-hover:bg-indigo-600 group-hover:rounded-[30px]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="w-full bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-6">
                Юридическая информация
              </h3>
              <div className="space-y-2 text-[13px] font-bold uppercase tracking-widest text-[#1e1b4b]">
                <p>ИП Арутюнов Эмиль Вагифович</p>
                <p>ИНН: 502806496938</p>
                <p>ОГРНИП: 323508100548341</p>
              </div>
            </div>
            <div className="md:text-right">
              <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-6">
                Контакты
              </h3>
              <div className="space-y-2 text-[13px] font-bold uppercase tracking-widest text-[#1e1b4b]">
                <p>Email: ar.em.v@yandex.ru</p>
                <p>Тел: +7 (925) 530-73-30</p>
                <div className="pt-4 flex md:justify-end gap-6 opacity-40">
                   <span className="text-[10px]">VISA</span>
                   <span className="text-[10px]">MASTERCARD</span>
                   <span className="text-[10px]">МИР</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              © 2025 Все права защищены
            </p>
            <div className="flex gap-8">
              <Link href="/policy" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">
                Публичная оферта
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}