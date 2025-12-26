import { getCart, removeFromCart } from "@/app/actions/cart";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import Link from "next/link";
import Image from "next/image";
import CartCheckoutButton from "@/components/cart/CartCheckoutButton";
import { X, FileText, ChevronLeft, CreditCard } from "lucide-react"; 

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-[#1e1b4b]">
                <CreditCard size={24} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-[#1e1b4b] mb-2">Войдите в аккаунт</h1>
            <p className="text-slate-400 mb-8 font-bold uppercase text-[9px] tracking-widest max-w-[240px] leading-relaxed">
                Корзина доступна только авторизованным пользователям
            </p>
            <Link href="/api/auth/signin" className="bg-[#1e1b4b] text-white px-8 py-4 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] shadow-lg shadow-indigo-900/10 hover:scale-105 transition-all">
                Войти в профиль
            </Link>
        </div>
    )
  }

  const cart = await getCart();
  const items = cart?.items || [];
  const totalPrice = items.reduce((sum: number, item: any) => sum + (item.product.price || 0), 0);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-[1100px] mx-auto px-6 pt-10">
        
        {/* ХЕДЕР СТРАНИЦЫ */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-50 pb-8">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1e1b4b] transition-colors mb-4">
                <ChevronLeft size={12} /> Назад в каталог
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1e1b4b]">
                Корзина <span className="text-indigo-500/40 ml-1">{items.length}</span>
            </h1>
          </div>
          <div className="flex flex-col md:items-end">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-0.5">Всего к оплате</span>
             <span className="text-2xl font-black tracking-tighter text-[#1e1b4b]">{totalPrice.toLocaleString()} ₽</span>
          </div>
        </header>

        {items.length === 0 ? (
           <div className="text-center py-24 rounded-[40px] border border-slate-100 bg-slate-50/30">
              <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Ваша корзина пуста</p>
              <Link href="/" className="inline-block bg-white border border-slate-200 text-[#1e1b4b] px-8 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-[#1e1b4b] hover:text-white transition-all">
                В каталог
              </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* СПИСОК ТОВАРОВ */}
              <div className="lg:col-span-7 space-y-3">
                 {items.map((item: any) => (
                    <div key={item.id} className="relative bg-white p-4 rounded-[28px] border border-slate-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group">
                        <div className="flex gap-5 items-center">
                            <div 
                                className="w-20 h-20 relative rounded-2xl flex-shrink-0 overflow-hidden bg-slate-50 border border-slate-100/50"
                                style={{ backgroundColor: item.product.bgColor || '#F8FAFC' }}
                            >
                                {item.product.imageUrl && (
                                    <Image src={item.product.imageUrl} alt="" fill className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"/>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-0.5 block">
                                    {item.product.category?.name || 'Решение'}
                                </span>
                                <h3 className="font-black text-sm text-[#1e1b4b] leading-tight mb-1 truncate pr-4 uppercase">
                                    {item.product.title}
                                </h3>
                                <p className="text-sm font-black tracking-tighter text-slate-400">
                                    {item.product.price.toLocaleString()} ₽
                                </p>
                            </div>
                            
                            <form action={async () => {
                                "use server";
                                await removeFromCart(item.id);
                            }}>
                                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                                    <X size={16} />
                                </button>
                            </form>
                        </div>

                        {/* БЛОК ОТВЕТОВ */}
                        {item.answers && Object.keys(item.answers).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(item.answers).map(([key, value]: [string, any]) => {
                                        const requirement = item.product.requirements?.[key];
                                        const label = requirement?.title || `Параметр ${Number(key) + 1}`;
                                        return (
                                            <div key={key} className="bg-slate-50/50 px-3 py-2 rounded-xl">
                                                <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
                                                <p className="text-[10px] font-bold text-[#1e1b4b] truncate">{String(value)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                 ))}
              </div>

              {/* ИТОГО */}
              <div className="lg:col-span-5 sticky top-28">
                 <div className="bg-[#1e1b4b] p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-900/20">
                    <div className="mb-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300/60 mb-4 block">Оформление</span>
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">К оплате:</span>
                            <span className="text-4xl font-black tracking-tighter leading-none">{totalPrice.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    
                    <CartCheckoutButton totalAmount={totalPrice} />

                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4 text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Secure SSL Payment • No Commission</p>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}