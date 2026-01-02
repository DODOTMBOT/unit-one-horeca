import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";     
import { prisma } from "@/lib/prisma";       
import { NextAuthProvider } from '@/components/Providers';
import { Toaster } from 'react-hot-toast'; // Добавлено для чек-листов

import UserNav from '@/components/UserNav'; 
import HeaderCartBtn from "@/components/cart/HeaderCartBtn";
import HeaderNavbar from "@/components/HeaderNavbar";
import HeaderWrapper from "@/components/HeaderWrapper";
import { Search } from 'lucide-react'; 

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unit One Ecosystem",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  // Логика корзины
  let cartCount = 0;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { cart: { include: { items: true } } }
    });
    cartCount = user?.cart?.items.length || 0;
  }

  // Меню
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
    <html lang="ru">
      <body className={`${inter.variable} bg-[#F3F4F6] text-slate-900 h-screen w-screen flex flex-col overflow-hidden font-sans`}>
        <NextAuthProvider>
          {/* TOASTER: Всплывающие уведомления (Зеленые/Красные плашки) */}
          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#fff',
                borderRadius: '1rem',
                fontSize: '14px',
                fontWeight: 'bold'
              },
            }}
          />
          
          {/* HEADER CONTAINER: Парящий слой */}
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <HeaderWrapper>
              {/* ЧЕРНАЯ КАПСУЛА: bg-[#1F2937] */}
              <header className="pointer-events-auto bg-[#1F2937] text-white h-[68px] w-full max-w-[1200px] rounded-full shadow-2xl flex items-center justify-between px-3 pl-6 transition-all">
                
                {/* ЛЕВАЯ ЧАСТЬ: Лого + Меню */}
                <div className="flex items-center gap-8">
                  {/* Бренд */}
                  <div className="font-bold tracking-wider text-sm flex items-center gap-2 text-white uppercase">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a3e635] shadow-[0_0_12px_#a3e635]" />
                    UNIT-ONE.RU
                  </div>
                  
                  {/* МЕНЮ: Стили для ссылок внутри черного хедера */}
                  <div className="hidden md:block">
                    <div className="text-gray-300 hover:text-white [&_a]:transition-colors [&_a:hover]:text-[#a3e635]">
                      <HeaderNavbar menuItems={menuItems} />
                    </div>
                  </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Иконки и Профиль */}
                <div className="flex items-center gap-3 pr-1">
                   {/* Поиск */}
                   <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                      <Search size={20} />
                   </button>

                   {/* Корзина */}
                   <div className="text-white hover:text-[#a3e635] transition-colors">
                      <HeaderCartBtn count={cartCount} /> 
                   </div>

                   {/* Разделитель */}
                   <div className="h-6 w-px bg-gray-600 mx-1" />

                   {/* Профиль */}
                   <div className="pl-1">
                      <UserNav />
                   </div>
                </div>
              </header>
            </HeaderWrapper>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full h-full pt-28 pb-10 px-4 md:px-8 overflow-y-auto no-scrollbar">
            <main className="max-w-[1200px] mx-auto min-h-full">
              {children}
            </main>
          </div>
          
        </NextAuthProvider>
      </body>
    </html>
  );
}