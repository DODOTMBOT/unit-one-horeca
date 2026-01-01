import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const permissions = [
    // --- Уровень 1: КОРНИ ---
    { name: '/admin', description: 'Панель администратора' },
    { name: '/partner', description: 'Панель партнёра' },

    // --- Уровень 2: АДМИН ---
    { name: '/admin/settings', description: 'Настройка сайта' },
    { name: '/admin/products', description: 'Маркетплейс решений' },
    { name: '/admin/haccp', description: 'Журналы ХАССП (Админ)' },
    { name: '/admin/settings/roles', description: 'Управление ролями' },
    { name: '/admin/users/list', description: 'Список пользователей' },

    // --- Уровень 2: ПАРТНЕР ---
    { name: '/partner/analytics', description: 'Аналитика и мониторинг' },
    
    // === ХАССП (ИСПРАВЛЕНО: Добавлены дочки) ===
    { name: '/partner/haccp', description: 'Журналы HACCP' },
    { name: '/partner/haccp/health', description: 'Журнал здоровья' },
    { name: '/partner/haccp/temperature', description: 'Температуры' },
    { name: '/partner/haccp/fryer', description: 'Фритюрные жиры' },
    { name: '/partner/haccp/quality', description: 'Бракераж' },
    
    // === ОФИС (Вложенность) ===
    { name: '/partner/office', description: 'Менеджер офиса' },
    { name: '/partner/office/staff', description: 'Сотрудники' },
    { name: '/partner/office/establishments', description: 'Рестораны' },
    { name: '/partner/office/equipment', description: 'Оборудование' },
  ]

  console.log('⏳ Очистка старых прав...')
  // Очищаем таблицу связей и прав (чтобы удалить дубли и мусор)
  await prisma.rolePermission.deleteMany({})
  await prisma.permission.deleteMany({})

  console.log('⏳ Запись новых путей в базу...')
  for (const p of permissions) {
    await prisma.permission.create({
      data: p
    })
  }

  // Находим роль OWNER (Владелец)
  const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } })
  
  // Если роль есть — даем ей ВСЕ права автоматически
  if (ownerRole) {
    console.log('⏳ Выдача прав владельцу...')
    const allPerms = await prisma.permission.findMany()
    
    // Создаем связи разом (быстрее)
    await prisma.rolePermission.createMany({
      data: allPerms.map(perm => ({
        roleId: ownerRole.id,
        permissionId: perm.id
      }))
    })
  }

  // Привязываем твой аккаунт к роли OWNER (чтобы ты не потерял доступ)
  const myEmail = "ar@ar.ru"
  if (ownerRole) {
    await prisma.user.updateMany({
      where: { email: myEmail },
      data: { 
        role: 'OWNER', 
        roleId: ownerRole.id 
      }
    })
    console.log(`✅ Аккаунт ${myEmail} обновлен до OWNER`)
  }

  console.log('✅ База успешно синхронизирована.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })