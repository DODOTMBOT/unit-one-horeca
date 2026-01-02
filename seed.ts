import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const permissions = [
    // --- УРОВЕНЬ 1: КОРНИ (category определяет большой блок) ---
    { name: '/admin', description: 'Панель администратора', category: 'admin', parentPath: null },
    { name: '/partner', description: 'Панель партнёра', category: 'partner', parentPath: null },

    // --- УРОВЕНЬ 2: ПОДРАЗДЕЛЫ ---
    { name: '/partner/office', description: 'Менеджер офиса', category: 'partner', parentPath: '/partner' },
    { name: '/partner/haccp', description: 'Жкрналы НАССР', category: 'partner', parentPath: '/partner' },

    // --- УРОВЕНЬ 3: ГЛУБОКАЯ ВЛОЖЕННОСТЬ (Тот самый 2motherid) ---
    { name: '/partner/office/staff', description: 'Сотрудники', category: 'partner', parentPath: '/partner/office' },
    { name: '/partner/office/roles', description: 'Роли и права', category: 'partner', parentPath: '/partner/office' },
    { name: '/partner/office/establishments', description: 'Рестораны', category: 'partner', parentPath: '/partner/office' },
    { name: '/partner/office/equipment', description: 'Оборудование', category: 'partner', parentPath: '/partner/office' }, 
    { name: '/partner/haccp/health', description: 'Журнал здоровья', category: 'partner', parentPath: '/partner/haccp' },  
    { name: '/partner/haccp/temperature', description: 'Журнал температурных режимов', category: 'partner', parentPath: '/partner/haccp' },  
    { name: '/partner/office/establishments/[id]/temperature', description: 'Заполнение журнала температурных режимов', category: 'partner', parentPath: '/partner/haccp/temperature' },  
    { name: '/partner/office/establishments/[id]/health', description: 'Заполнение журнала здоровья', category: 'partner', parentPath: '/partner/haccp/health' },  ]


  console.log('⏳ Очистка данных...')
  await prisma.rolePermission.deleteMany({})
  await prisma.permission.deleteMany({})
  await prisma.role.deleteMany({ where: { ownerId: null } }) 

  console.log('⏳ Создание разрешений...')
  // 1. Создаем все записи без связей
  for (const p of permissions) {
    await prisma.permission.create({
      data: { name: p.name, description: p.description, category: p.category }
    })
  }

  // 2. Проставляем иерархию (parentId)
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

  console.log('⏳ Создание системных ролей...')
  const ownerRole = await prisma.role.create({ data: { name: 'OWNER', ownerId: null } })
  const partnerRole = await prisma.role.create({ data: { name: 'PARTNER', ownerId: null } })
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN', ownerId: null } })

  const allPerms = await prisma.permission.findMany()
  await prisma.rolePermission.createMany({
    data: allPerms.map(perm => ({ roleId: ownerRole.id, permissionId: perm.id }))
  })

  const partnerPerms = allPerms.filter(p => p.category === 'partner')
  await prisma.rolePermission.createMany({
    data: partnerPerms.map(perm => ({ roleId: partnerRole.id, permissionId: perm.id }))
  })

  const myEmail = "ar@ar.ru"
  const user = await prisma.user.findUnique({ where: { email: myEmail } })
  if (user) {
    await prisma.user.update({
      where: { email: myEmail },
      data: { role: 'OWNER', roleId: ownerRole.id }
    })
  }
  console.log('✅ База синхронизирована.')
}

main().finally(() => prisma.$disconnect())