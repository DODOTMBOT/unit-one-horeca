import { PrismaClient } from '@prisma/client'

// Определяем интерфейс для глобального объекта, чтобы TS не ругался на переменную prisma
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Опционально: включи логирование ошибок в консоль
    log: ['error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Используем существующий экземпляр или создаем новый (Singleton)
export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma