import prisma from '../prisma/client';
import { subjectService } from './subject.service';

export class PomodoroService {
  async create(userId: string, duration: number, subjectId?: string, subjectName?: string) {
    let finalSubjectId = subjectId;

    if (!finalSubjectId && subjectName) {
      const subject = await subjectService.findOrCreate(userId, subjectName);
      finalSubjectId = subject.id;
    }

    const session = await prisma.pomodoroSession.create({
      data: {
        userId,
        duration,
        subjectId: (finalSubjectId as any) || null,
        completedAt: new Date(),
      },
    });

    // Update user's total study minutes
    await prisma.user.update({
      where: { id: userId },
      data: { 
        totalStudyMinutes: { increment: duration } 
      } as any,
    });

    return session;
  }

  async getByUser(userId: string, limit = 50) {
    return prisma.pomodoroSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayStats, weekStats, totalStats] = await Promise.all([
      prisma.pomodoroSession.aggregate({
        where: { userId, completedAt: { gte: today } },
        _count: true,
        _sum: { duration: true },
      }),
      prisma.pomodoroSession.aggregate({
        where: { userId, completedAt: { gte: weekAgo } },
        _count: true,
        _sum: { duration: true },
      }),
      prisma.pomodoroSession.aggregate({
        where: { userId },
        _count: true,
        _sum: { duration: true },
      }),
    ]);

    return {
      today: { count: todayStats._count, totalMinutes: todayStats._sum.duration || 0 },
      week: { count: weekStats._count, totalMinutes: weekStats._sum.duration || 0 },
      total: { count: totalStats._count, totalMinutes: totalStats._sum.duration || 0 },
    };
  }
}

export const pomodoroService = new PomodoroService();
