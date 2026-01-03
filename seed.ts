import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const permissions = [
    // --- УРОВЕНЬ 1: КОРНИ ---
    { name: '/admin', description: 'Панель администратора', category: 'admin', parentPath: null },
    { name: '/partner', description: 'Панель партнёра', category: 'partner', parentPath: null },

    // --- УРОВЕНЬ 2: ПОДРАЗДЕЛЫ ---
    { name: '/partner/office', description: 'Менеджер офиса', category: 'partner', parentPath: '/partner' },
    { name: '/partner/haccp', description: 'Журналы НАССР', category: 'partner', parentPath: '/partner' },
    { name: '/partner/checklists-block', description: 'Чеклисты', category: 'partner', parentPath: '/partner' },

    // --- УРОВЕНЬ 3: ГЛУБОКАЯ ВЛОЖЕННОСТЬ ---
    { name: '/partner/office/staff', description: 'Сотрудники', category: 'partner', parentPath: '/partner/office' },
    { name: '/partner/office/roles', description: 'Роли и права', category: 'partner', parentPath: '/partner/office' },
    { name: '/partner/office/establishments', description: 'Рестораны', category: 'partner', parentPath: '/partner/office' },
    { name: '/partner/office/equipment', description: 'Оборудование', category: 'partner', parentPath: '/partner/office' }, 
    { name: '/partner/haccp/health', description: 'Журнал здоровья', category: 'partner', parentPath: '/partner/haccp' },  
    { name: '/partner/haccp/temperature', description: 'Журнал температурных режимов', category: 'partner', parentPath: '/partner/haccp' },  
    { name: '/partner/checklists/new', description: 'Создать чеклист', category: 'partner', parentPath: '/partner/checklists-block' },
    { name: '/partner/checklists/assign', description: 'Назначить чеклист', category: 'partner', parentPath: '/partner/checklists-block' },
    { name: '/partner/checklists/reports', description: 'Отчеты по чеклистам', category: 'partner', parentPath: '/partner/checklists-block' },

    // --- УРОВЕНЬ 4 ---
    { name: '/partner/office/establishments/[id]/temperature', description: 'Заполнение журнала температурных режимов', category: 'partner', parentPath: '/partner/haccp/temperature' },  
    { name: '/partner/office/establishments/[id]/health', description: 'Заполнение журнала здоровья', category: 'partner', parentPath: '/partner/haccp/health' },
  ]

  console.log('⏳ Шаг 1: Синхронизация разрешений...')
  await prisma.rolePermission.deleteMany({})
  await prisma.permission.deleteMany({})

  for (const p of permissions) {
    await prisma.permission.create({
      data: { name: p.name, description: p.description, category: p.category }
    })
  }

  for (const p of permissions) {
    if (p.parentPath) {
      const parent = await prisma.permission.findUnique({ where: { name: p.parentPath } })
      if (parent) {
        await prisma.permission.update({
          where: { name: p.name },
          data: { parentId: parent.id }
        })
      }
    }
  }

  console.log('⏳ Шаг 2: Создание/Обновление системных ролей...')

  // Функция-помощник для обхода ошибки Upsert
  const getOrCreateRole = async (name: string) => {
    let role = await prisma.role.findFirst({ where: { name } })
    if (!role) {
      role = await prisma.role.create({
        data: { name, ownerId: null }
      })
    }
    return role
  }

  const ownerRole = await getOrCreateRole('OWNER')
  const partnerRole = await getOrCreateRole('PARTNER')

  const allPerms = await prisma.permission.findMany()
  
  await prisma.rolePermission.createMany({
    data: [
      ...allPerms.map(perm => ({ roleId: ownerRole.id, permissionId: perm.id })),
      ...allPerms.filter(p => p.category === 'partner').map(perm => ({ roleId: partnerRole.id, permissionId: perm.id }))
    ]
  })

  console.log('⏳ Шаг 3: Массовое восстановление доступа пользователей...')
  
  const myEmail = "ar@ar.ru"
  
  // 1. Твой аккаунт
  await prisma.user.updateMany({
    where: { email: myEmail },
    data: { 
      role: 'OWNER', 
      roleId: ownerRole.id 
    }
  })

  // 2. Все остальные (Партнеры)
  await prisma.user.updateMany({
    where: { 
      email: { not: myEmail }
    },
    data: { 
      role: 'PARTNER', 
      roleId: partnerRole.id 
    }
  })

  console.log('✅ База синхронизирована. Пропишите Logout/Login.')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка сида:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })