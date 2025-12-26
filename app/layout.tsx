import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";     
import { prisma } from "@/lib/prisma";       
import { NextAuthProvider } from '@/components/Providers';

import UserNav from '@/components/UserNav'; 
import HeaderCartBtn from "@/components/cart/HeaderCartBtn";
import HeaderNavbar from "@/components/HeaderNavbar";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HoReCa Solutions",
  description: "Магазин управленческих решений HoReCa",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  let cartCount = 0;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { cart: { include: { items: true } } }
    });
    cartCount = user?.cart?.items.length || 0;
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      parentId: null,
      isVisible: true,
      ...(userRole !== "ADMIN" ? { isAdmin: false } : {})
    },
    include: {
      children: {
        where: { isVisible: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} bg-white text-[#1e1b4b] antialiased`}>
        <NextAuthProvider>
          {/* ХЕДЕР: Теперь по-настоящему чистый и "стеклянный" */}
          <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-6 pointer-events-none">
            <div className="w-full max-w-[1400px] h-20 bg-white/80 backdrop-blur-xl rounded-full px-10 flex items-center justify-between pointer-events-auto border border-slate-100 shadow-[0_8px_32px_rgba(30,27,75,0.04)]">
              
              <Link href="/" className="text-base font-black tracking-tighter uppercase text-[#1e1b4b] shrink-0 hover:opacity-70 transition-opacity">
                HoReCa.Solutions
              </Link>

              {/* Центральное меню */}
              <HeaderNavbar menuItems={menuItems} />
              
              <div className="flex items-center gap-6 shrink-0">
                 <div className="hover:scale-110 transition-transform duration-300">
                    <HeaderCartBtn count={cartCount} />
                 </div>
                 
                 {/* Разделитель стал нейтральным и аккуратным */}
                 <div className="w-px h-6 bg-slate-100" />
                 
                 <UserNav />
              </div>
            </div>
          </header>

          {/* КОНТЕНТ: Добавлена гарантия белого фона */}
          <div className="w-full min-h-screen pt-32 bg-white">
            <main className="w-full">
              {children}
            </main>
          </div>

          {/* ФУТЕР: Приведен к стилю Marketplace */}
          <footer className="border-t border-slate-50 bg-white py-24 px-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mt-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1400px] mx-auto">
              <div className="tracking-tighter text-[#1e1b4b] opacity-20">
                © 2025 HoReCa Solutions
              </div>
              <div className="flex gap-16">
                <Link href="/" className="hover:text-indigo-500 transition-all">Методология</Link>
                <Link href="/" className="hover:text-indigo-500 transition-all">Поддержка</Link>
              </div>
            </div>
          </footer>
        </NextAuthProvider>
      </body>
    </html>
  );
}