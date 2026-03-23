import prisma from '../src/prisma/client';

async function migrate() {
  console.log('🚀 Starting study time migration...');
  
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    const totalMinutes = await prisma.pomodoroSession.aggregate({
      where: { userId: user.id },
      _sum: {
        duration: true,
      },
    });

    const sum = totalMinutes._sum.duration || 0;
    
    await prisma.user.update({
      where: { id: user.id },
      data: { totalStudyMinutes: sum } as any,
    });

    console.log(`Updated user ${user.name}: ${sum} minutes.`);
  }

  console.log('✅ Migration complete!');
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
