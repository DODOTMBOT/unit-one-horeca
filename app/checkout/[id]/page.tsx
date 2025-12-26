import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/cart/AddToCartButton";

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { 
      category: true, 
      productType: true,
      materials: true 
    }
  });

  if (!product) notFound();

  const getFileStats = () => {
    if (!product.materials || product.materials.length === 0) return null;
    const stats = product.materials.reduce((acc: Record<string, number>, file) => {
      const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      acc[extension] = (acc[extension] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stats).map(([ext, count]) => `${ext}: ${count}`).join(', ');
  };

  const fileStatsString = getFileStats();
  const requirements = Array.isArray(product.requirements) ? product.requirements : [];
  const hasRequirements = requirements.length > 0 && requirements.some((r: any) => r.title || r.details);

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-8 lg:py-12">
        
        {/* ВЕРХНИЙ БЛОК: ЗАГОЛОВОК И ТЕГИ (ВИДНО СРАЗУ) */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            {product.category && (
              <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                {product.category.name}
              </span>
            )}
            {product.productType && (
              <span className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {product.productType.name}
              </span>
            )}
          </div>
          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-[#1e1b4b] leading-none max-w-4xl">
            {product.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ЛЕВАЯ КОЛОНКА: ИЗОБРАЖЕНИЕ (УМЕНЬШЕНО ПО ВЫСОТЕ) */}
          <div className="lg:col-span-4 space-y-6">
            <div 
              className="relative aspect-square w-full overflow-hidden rounded-[40px] shadow-sm"
              style={{ backgroundColor: product.bgColor || "#f8fafc" }}
            >
              {product.imageUrl && (
                <Image 
                  src={product.imageUrl} 
                  alt={product.title} 
                  fill 
                  className="object-contain p-8 lg:p-12 transition-transform duration-1000 hover:scale-105" 
                  priority 
                />
              )}
            </div>

            {/* МАТЕРИАЛЫ ПОД ФОТО */}
            {fileStatsString && !hasRequirements && (
              <div className="bg-slate-50 p-5 rounded-[30px] border border-transparent transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm border border-slate-100">
                    📦
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                      Форматы файлов:
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-tighter text-[#1e1b4b]">
                      {fileStatsString}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ЦЕНТРАЛЬНАЯ КОЛОНКА: КРАТКОЕ ОПИСАНИЕ И ПОЛНОЕ */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Кратко о решении</h4>
               <p className="text-lg lg:text-xl font-bold text-slate-500 leading-snug">
                {product.shortDescription}
              </p>
            </div>

            <div className="pt-8 border-t border-slate-50">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Детальное описание</h4>
                <div className="text-[#1e1b4b]/80 leading-relaxed font-medium whitespace-pre-wrap text-base">
                  {product.description}
                </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: ВИДЖЕТ ПОКУПКИ (STICKY) */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-100/30">
               <div className="mb-6">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">Стоимость</span>
                 <div className="text-5xl font-black mt-1 tracking-tighter text-[#1e1b4b]">
                   {product.price.toLocaleString('ru-RU')} ₽
                 </div>
               </div>
               
               <AddToCartButton 
                productId={product.id} 
                price={product.price} 
                requirements={hasRequirements ? (requirements as any) : []}
               />

               <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg shrink-0">
                    ⚡
                  </div>
                  <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#1e1b4b]">Мгновенная доставка</div>
                      <div className="text-[10px] text-slate-400 font-bold">Файлы придут на Email сразу</div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}