import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

const SUPER_ADMIN_EMAIL = "ar.em.v@yandex.ru"; 

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN" || user?.email === SUPER_ADMIN_EMAIL;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-black">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-6xl">⛔️</div>
          <h1 className="mb-2 text-2xl font-bold">Доступ запрещен</h1>
          <p className="mb-8 text-neutral-600">
            Аккаунт <span className="font-semibold">{user?.email || "гостя"}</span> не админ.
          </p>
          <Link href="/" className="block w-full rounded-xl bg-black py-3 font-bold text-white uppercase text-[10px] tracking-widest">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}