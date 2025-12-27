import { prisma } from '@/lib/prisma';
import ProfileAlert from "@/components/ProfileAlert";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

// Запасные иллюстрации
const FallbackIllustration = ({ id }: { id: string }) => {
  if (id === 'marketplace') return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 fill-current text-indigo-600">
      <path d="M20 35 L80 35 L85 85 L15 85 Z" fillOpacity="0.1" />
      <path d="M35 35 Q50 10 65 35" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="20" y="35" width="60" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
  if (id === 'service') return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 fill-current text-orange-600">
      <circle cx="50" cy="50" r="30" fillOpacity="0.1" />
      <path d="M50 20 L50 30 M50 70 L50 80 M20 50 L30 50 M70 50 L80 50" stroke="currentColor" strokeWidth="4" />
      <path d="M30 30 L37 37 M63 63 L70 70 M30 70 L37 63 M63 37 L70 30" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
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
    <div className="bg-white min-h-screen flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex flex-col items-center px-6 lg:px-12 pt-12 md:pt-16">
        
        <div className="w-full max-w-4xl text-center mb-12">
          <div className="mb-6 inline-block text-left">
            <ProfileAlert />
          </div>

          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-3 block">
            Unit One Platform
          </span>
          
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#1e1b4b] mb-4">
            Экосистема бизнеса
          </h2>
          
          <div className="h-1 w-16 bg-indigo-500 rounded-full mx-auto" />
        </div>

        <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
          {directions.map((item: any) => (
            <Link 
              key={item.id} 
              href={item.href || '#'}
              className="group relative flex flex-col items-center gap-6 transition-all duration-500"
            >
              <div 
                className={`
                  w-40 h-40 md:w-56 md:h-56 
                  rounded-[50px] md:rounded-[70px] 
                  border border-slate-100
                  flex items-center justify-center 
                  grayscale group-hover:grayscale-0 
                  group-hover:bg-white group-hover:border-transparent
                  group-hover:shadow-[0_30px_60px_-15px] 
                  transition-all duration-500
                `}
                style={{ 
                  backgroundColor: item.bgColor || '#F8FAFC',
                  // Исправлено: удален null и некорректные типы для boxShadow
                  boxShadow: item.activeColor ? 'inherit' : undefined 
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                  {item.imageUrl ? (
                    <div className="relative w-3/4 h-3/4">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill 
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <FallbackIllustration id={item.id} />
                  )}
                </div>
              </div>

              <div className="text-center transition-all duration-500 opacity-40 group-hover:opacity-100 group-hover:translate-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {item.title}
                </p>
                <p className="text-lg font-bold text-[#1e1b4b]">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="w-full py-12 opacity-30 hover:opacity-100 transition-opacity mt-auto">
        <div className="max-w-[1440px] mx-auto px-12 flex flex-col md:flex-row justify-center items-center gap-8 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <p>ИП Арутюнов Эмиль Вагифович</p>
          <p>ИНН: 502806496938</p>
          <div className="flex gap-6">
            <Link href="/policy">Политика</Link>
            <Link href="/terms">Оферта</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}