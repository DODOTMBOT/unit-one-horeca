"use client";

import { usePathname } from "next/navigation";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Проверяем, начинается ли путь с /partner
  // Если да — возвращаем null (скрываем содержимое), если нет — показываем
  const isPartnerPage = pathname?.startsWith("/partner");

  if (isPartnerPage) return null;

  return <>{children}</>;
}