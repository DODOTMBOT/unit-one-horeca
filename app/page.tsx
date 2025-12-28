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
    <div className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* Уменьшен верхний отступ (pt-4 md:pt-6), чтобы поднять контент к меню */}
      <div className="flex-1 flex flex-col items-center px-4 md:px-8 pt-4 md:pt-6 text-center">
        
        {/* HEADER - Сделан компактнее по отступам */}
        <div className="w-full max-w-4xl mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1e1b4b] mb-3">
            Экосистема бизнеса
          </h2>
          <div className="h-1 w-16 bg-indigo-500 rounded-full mx-auto" />
        </div>

        {/* GRID CONTAINER - Увеличены размеры кругов и вертикальные отступы (gap-y-20) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20 md:gap-x-12 md:gap-y-24 w-full max-w-[1400px] mx-auto pb-24">
          {directions.map((item: any) => {
            const isSoon = item.isComingSoon === true;

            const CardContent = (
              <div className="flex flex-col items-center group">
                {/* КРУГ: Увеличен размер до w-48/72 (было w-40/60) */}
                <div 
                  className={`
                    relative w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72 
                    rounded-full overflow-hidden
                    flex items-center justify-center 
                    transition-all duration-700 ease-in-out
                    border border-slate-100 mb-6
                    ${isSoon 
                      ? 'border-dashed border-slate-300 bg-slate-50 grayscale opacity-40 shadow-none' 
                      : 'bg-[#F8FAFC] group-hover:bg-white group-hover:border-transparent group-hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] grayscale group-hover:grayscale-0'
                    }
                  `}
                >
                  <div className={`relative w-full h-full transition-transform duration-700 ease-out ${!isSoon && 'group-hover:scale-110'}`}>
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill 
                        className="object-cover" 
                        unoptimized 
                      />
                    ) : (
                      <FallbackIllustration id={item.id} />
                    )}
                  </div>

                  {isSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-10">
                       <span className="bg-[#1e1b4b] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                         Soon
                       </span>
                    </div>
                  )}
                </div>

                {/* ТЕКСТ - Чуть увеличены размеры для баланса с большими кругами */}
                <div className={`text-center transition-all duration-500 ${isSoon ? 'opacity-30' : 'opacity-60 group-hover:opacity-100 group-hover:translate-y-1'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">
                    {item.title}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-[#1e1b4b] leading-tight px-2">
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

      <footer className="w-full py-10 opacity-30 hover:opacity-100 transition-opacity mt-auto border-t border-slate-50">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <p>© Unit One Platform • {new Date().getFullYear()}</p>
          <div className="flex gap-8">
            <Link href="/policy" className="hover:text-indigo-600 transition-colors">Политика</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Оферта</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}