import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProductsHubPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="mx-auto max-w-5xl">
        
        {/* Шапка */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Товары</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Управление пользователями
            </p>
          </div>
          <Link href="/admin" className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">
            ← В главное меню
          </Link>
        </div>

        {/* ТРИ СЕРЫХ БЛОКА */}
        <div className="grid gap-6 sm:grid-cols-2">
          
          {/* Блок 1: Список пользователей */}
          <Link 
            href="/admin/users/list"
            className="group flex min-h-[180px] flex-col rounded-2xl bg-neutral-100 p-6 transition hover:bg-neutral-200"
          >
            <h2 className="text-2xl font-bold text-neutral-900">
              Список пользователей
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 group-hover:text-neutral-600">
              Списко пользователей сервиса
            </p>
          </Link>

          {/* Блок 2: Редактировать / Удалить */}
          <Link 
            href="/admin/products/manage"
            className="group flex min-h-[180px] flex-col rounded-2xl bg-neutral-100 p-6 transition hover:bg-neutral-200"
          >
            <h2 className="text-2xl font-bold text-neutral-900">
              Редакция каталога
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 group-hover:text-neutral-600">
              Список всех действующих товаров. Изменение данных и удаление.
            </p>
          </Link>

                    {/* Блок 3: Категории */}
          <Link 
            href="/admin/products/categories"
            className="group flex min-h-[180px] flex-col rounded-2xl bg-neutral-100 p-6 transition hover:bg-neutral-200"
          >
            <h2 className="text-2xl font-bold text-neutral-900">
              Категории
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 group-hover:text-neutral-600">
              Управление списком категорий. Добавление новых и переименование текущих.
            </p>
          </Link>

                    {/* Блок 4: Типы продукта*/}
          <Link 
            href="/admin/types"
            className="group flex min-h-[180px] flex-col rounded-2xl bg-neutral-100 p-6 transition hover:bg-neutral-200"
          >
            <h2 className="text-2xl font-bold text-neutral-900">
              Типы продуктов
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 group-hover:text-neutral-600">
              Список типов продуктов и их управление.
            </p>
          </Link>


        </div>
      </div>
    </div>
  );
}