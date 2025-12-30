import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. ОПРЕДЕЛЯЕМ ПРАВА ДОСТУПА КАК ПУТИ (Pathnames)
  const permissions = [
    // Уровень 1
    { name: '/admin', description: 'Доступ в общую админ-панель' },
    { name: '/partner', description: 'Доступ в панель партнера' },

    // Уровень 2: Админка
    { name: '/admin/users', description: 'Просмотр и поиск пользователей' },
    { name: '/admin/roles', description: 'Управление ролями и правами доступа' }, // КРИТИЧНО
    { name: '/admin/marketplace', description: 'Управление товарами и категориями' },
    { name: '/admin/haccp', description: 'Глобальный мониторинг ХАССП' },
    { name: '/admin/orders', description: 'Просмотр всех заказов платформы' },

    // Уровень 2: Партнер
    { name: '/partner/haccp', description: 'Журналы ХАССП заведения' },
    { name: '/partner/staff', description: 'Управление сотрудниками заведения' },
    { name: '/partner/settings', description: 'Настройки профиля бизнеса' },
    { name: '/partner/analytics', description: 'Аналитика продаж и чеков' },
  ]

  console.log('⏳ Синхронизация страниц доступа (Permissions)...')
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: p,
    })
  }

  // 2. ОПРЕДЕЛЯЕМ БАЗОВЫЕ РОЛИ
  const roles = ['OWNER', 'ADMIN', 'PARTNER', 'MANAGER', 'USER']

  console.log('⏳ Синхронизация базовых ролей...')
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
  }

  // 3. ПРИВЯЗКА ПРАВ ДЛЯ OWNER И ADMIN
  const allPerms = await prisma.permission.findMany()
  const superRoles = ['OWNER', 'ADMIN']

  for (const roleName of superRoles) {
    const roleRecord = await prisma.role.findUnique({ where: { name: roleName } })
    
    if (roleRecord) {
      console.log(`⏳ Настройка полных прав для роли: ${roleName}...`)
      for (const perm of allPerms) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: roleRecord.id,
              permissionId: perm.id
            }
          },
          update: {},
          create: {
            roleId: roleRecord.id,
            permissionId: perm.id
          }
        })
      }
    }
  }

  // 4. ПРИНУДИТЕЛЬНАЯ ПРИВЯЗКА ТВОЕГО АККАУНТА К OWNER
  // Чтобы ты точно мог зайти и настраивать систему
  const myEmail = "ar.em.v@yandex.ru" // Твоя почта из логов
  const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } })

  if (ownerRole) {
    console.log(`⏳ Назначение роли OWNER для ${myEmail}...`)
    await prisma.user.update({
      where: { email: myEmail },
      data: { 
        role: 'OWNER', // Старый enum
        roleId: ownerRole.id // Новая таблица
      }
    })
  }

  console.log('✅ Сид успешно завершен! Теперь перезайди в аккаунт на сайте.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })