import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DownloadButton } from "./DownloadButtonComponent";

export default async function OrderSuccessPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ orderId?: string }> 
}) {
  const { orderId } = await searchParams;

  if (!orderId) return notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: { materials: true }
          },
        },
      },
    },
  });

  if (!order) return notFound();

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 font-sans text-slate-900">
      <div className="max-w-[800px] mx-auto">
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Назад в личный кабинет
        </Link>

        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-[30px] flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-100">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2 italic leading-none">
            Доступ открыт
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Заказ #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="space-y-6">
          {order.items.map((item) => (
            <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                  <Package size={20} />
                </div>
                <h3 className="font-black uppercase tracking-tight text-sm leading-tight">
                  {item.product.title}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {item.product.materials.map((file) => (
                    <DownloadButton key={file.id} url={file.url} fileName={file.name} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}