import { prisma } from '@/lib/prisma';
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck, LayoutGrid } from 'lucide-react'; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FallbackIcon = ({ isHighlighted }: { isHighlighted: boolean }) => (
  <LayoutGrid 
    size={40} 
    strokeWidth={1.5} 
    className={isHighlighted ? 'text-black opacity-80' : 'text-gray-400'} 
  />
);

export default async function Home() {
  const directions = await prisma.direction.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' }
  });

  return (
    <div className="flex flex-col gap-12 pb-20">
      
      {/* HERO ЗАГОЛОВОК */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div>
          <h1 className="text-4xl md:text-6xl font-light text-[#111827] tracking-tighter">
            Ecosystem
          </h1>
          <p className="text-gray-500 font-medium mt-3 text-lg ml-1">
            Выберите модуль для начала работы
          </p>
        </div>
        
        <div className="flex flex-col items-end pb-2">
          <span className="text-4xl font-light text-[#111827]">{directions.length}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Доступно</span>
        </div>
      </div>

      {/* СЕТКА МОДУЛЕЙ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {directions.map((item: any, index: number) => {
          const isSoon = item.isComingSoon === true;
          
          // Первая активная карточка - Лаймовая
          const isHighlighted = index === 0 && !isSoon; 

          const CardContent = (
            <div 
              className={`
                relative h-64 p-8 rounded-[2.5rem] flex flex-col justify-between transition-all duration-300
                ${isHighlighted 
                  ? 'bg-[#a3e635] shadow-[0_20px_40px_-10px_rgba(163,230,53,0.5)]' 
                  : 'bg-white shadow-soft hover:shadow-xl border border-transparent hover:border-gray-200'
                }
                ${isSoon ? 'opacity-60 grayscale cursor-default' : 'cursor-pointer group'}
              `}
            >
              {/* ВЕРХ */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-4
                    ${isHighlighted ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}
                  `}>
                    0{index + 1}
                  </div>

                  <h3 className={`text-2xl font-bold leading-tight ${isHighlighted ? 'text-black' : 'text-[#111827]'}`}>
                    {item.subtitle}
                  </h3>
                  <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${isHighlighted ? 'text-black/60' : 'text-gray-400'}`}>
                    {item.title}
                  </p>
                </div>

                <div className="shrink-0">
                   {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        width={48} 
                        height={48} 
                        className={`object-contain transition-transform duration-500 ${!isSoon && 'group-hover:scale-110'}`}
                        unoptimized
                      />
                   ) : (
                      <FallbackIcon isHighlighted={isHighlighted} />
                   )}
                </div>
              </div>

              {/* НИЗ */}
              <div className="flex items-end justify-between mt-4">
                 {isSoon ? (
                   <div className="px-3 py-1.5 rounded-full border border-dashed border-gray-400 text-gray-500 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                     <ShieldCheck size={14} />
                     Скоро
                   </div>
                 ) : (
                   <div className="w-full flex justify-end">
                     <div className={`
                       w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                       ${isHighlighted 
                         ? 'bg-black text-white group-hover:scale-110' 
                         : 'bg-gray-100 text-gray-900 group-hover:bg-[#a3e635] group-hover:text-black'
                       }
                     `}>
                       <ArrowUpRight size={24} />
                     </div>
                   </div>
                 )}
              </div>
            </div>
          );

          return isSoon ? (
            <div key={item.id}>{CardContent}</div>
          ) : (
            <Link key={item.id} href={item.href || '#'} className="block no-underline">
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}