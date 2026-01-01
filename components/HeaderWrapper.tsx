"use client";

import { usePathname } from "next/navigation";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  /**
   * Скрываем содержимое обертки только для профиля.
   * Удалена проверка /partner, чтобы меню было видно в панели партнера.
   */
  const isHiddenPage = pathname?.startsWith("/profile");

  if (isHiddenPage) return null;

  return <>{children}</>;
}