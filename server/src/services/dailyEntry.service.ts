import prisma from '../prisma/client';
import { subjectService } from './subject.service';

export class DailyEntryService {
  async create(data: {
    userId: string;
    subjectId?: string;
    subjectName?: string;
    correct: number;
    wrong: number;
  }) {
    let subjectId = data.subjectId;

    // If subjectName is provided instead of subjectId, find or create the subject
    if (!subjectId && data.subjectName) {
      const subject = await subjectService.findOrCreate(data.userId, data.subjectName);
      subjectId = subject.id;
    }

    if (!subjectId) {
      throw new Error('Konu ID veya konu adı gerekli');
    }

    const totalNew = data.correct + data.wrong;

    // Create the daily entry
    const entry = await prisma.dailyEntry.create({
      data: {
        userId: data.userId,
        subjectId,
        date: new Date(),
        correct: data.correct,
        wrong: data.wrong,
      },
      include: { subject: true },
    });

    // Update streak and totalQuestions
    await this.updateStreak(data.userId, totalNew);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayEntries = await prisma.dailyEntry.findMany({
      where: {
        userId: data.userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: {
        correct: true,
        wrong: true,
      }
    });

    const todayTotal = todayEntries.reduce((sum: number, e: { correct: number, wrong: number }) => sum + e.correct + e.wrong, 0);

    return { entry, todayTotal };
  }

  async getByUser(userId: string, limit = 50) {
    return prisma.dailyEntry.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getByDate(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.dailyEntry.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: { subject: true },
      orderBy: { date: 'desc' },
    });
  }

  private async updateStreak(userId: string, newQuestions: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = user.streak;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day -> increment streak
        newStreak += 1;
      } else if (diffDays > 1) {
        // Missed day(s) -> reset streak
        newStreak = 1;
      }
      // diffDays === 0 means same day, streak stays the same
    } else {
      // First entry ever
      newStreak = 1;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastActiveDate: new Date(),
        totalQuestions: { increment: newQuestions },
      },
    });
  }
}

export const dailyEntryService = new DailyEntryService();
