"use client";

import { usePathname } from "next/navigation";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  /**
   * Скрываем содержимое обертки (хедер, футер, отступы), 
   * если путь начинается с /partner ИЛИ с /profile.
   */
  const isHiddenPage = pathname?.startsWith("/partner") || pathname?.startsWith("/profile");

  if (isHiddenPage) return null;

  return <>{children}</>;
}