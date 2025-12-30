import { prisma } from '@/lib/prisma';
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FallbackIllustration = ({ id }: { id: string }) => {
  if (id === 'marketplace') return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 fill-current text-indigo-600">
      <path d="M20 35 L80 35 L85 85 L15 85 Z" fillOpacity="0.1" />
      <path d="M35 35 Q50 10 65 35" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="20" y="35" width="60" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 fill-current text-slate-600">
      <rect x="20" y="20" width="60" height="60" rx="8" fillOpacity="0.1" />
      <path d="M35 65 L35 45 M50 65 L50 30 M65 65 L65 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
};

export default async function Home() {
  const directions = await prisma.direction.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' }
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center px-4 md:px-8 pt-10 md:pt-16 text-center">
        
        {/* HEADER - Плоский стиль */}
        <div className="w-full max-w-4xl mb-16 md:mb-24">
          <div className="inline-block px-12 py-4 bg-white border border-slate-100 rounded-[1.5rem] mb-6">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800 leading-none">
              Экосистема бизнеса
            </h1>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            Выберите направление для работы с платформой
          </p>
        </div>

        {/* GRID CONTAINER - Убраны тени, добавлена лавандовая обводка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 w-full max-w-[1400px] mx-auto pb-24">
          {directions.map((item: any) => {
            const isSoon = item.isComingSoon === true;

            const CardContent = (
              <div className="flex flex-col items-center group w-full">
                {/* КРУГ: Теперь плоский с лавандовой обводкой при наведении */}
                <div 
                  className={`
                    relative w-64 h-64 lg:w-72 lg:h-72 
                    rounded-[3rem] overflow-hidden
                    flex items-center justify-center 
                    transition-all duration-500 ease-in-out
                    border bg-white
                    ${isSoon 
                      ? 'border-dashed border-slate-200 opacity-40' 
                      : 'border-slate-100 group-hover:border-[#7171a7]'
                    }
                  `}
                >
                  <div className="relative w-full h-full p-4">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill 
                        className={`object-cover rounded-[2.5rem] p-2 transition-transform duration-700 ${!isSoon && 'group-hover:scale-105'}`}
                        unoptimized 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FallbackIllustration id={item.id} />
                      </div>
                    )}
                  </div>

                  {isSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10">
                       <span className="text-[#1e1b4b] border border-[#1e1b4b] px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                         Soon
                       </span>
                    </div>
                  )}
                </div>

                {/* ТЕКСТ */}
                <div className={`mt-8 text-center transition-all duration-500 ${isSoon ? 'opacity-20' : 'opacity-100 group-hover:translate-y-1'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#7171a7] mb-3">
                    {item.title}
                  </p>
                  <h3 className="text-lg md:text-xl font-black text-[#1e1b4b] leading-tight uppercase tracking-tighter px-4">
                    {item.subtitle}
                  </h3>
                </div>
              </div>
            );

            return isSoon ? (
              <div key={item.id} className="relative cursor-default flex justify-center">
                {CardContent}
              </div>
            ) : (
              <Link 
                key={item.id} 
                href={item.href || '#'} 
                className="relative cursor-pointer flex justify-center"
              >
                {CardContent}
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="w-full py-12 mt-auto border-t border-slate-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
          <p>© Unit One Ecosystem • {new Date().getFullYear()}</p>
          <div className="flex gap-10">
            <Link href="/policy" className="hover:text-[#7171a7] transition-colors">Политика</Link>
            <Link href="/terms" className="hover:text-[#7171a7] transition-colors">Оферта</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}