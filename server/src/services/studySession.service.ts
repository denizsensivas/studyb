import prisma from '../prisma/client';
import { subjectService } from './subject.service';

export class StudySessionService {
  async create(data: {
    userId: string;
    subjectId?: string;
    subjectName?: string;
    duration: number; // in minutes
    notes?: string;
  }) {
    let subjectId = data.subjectId;

    if (!subjectId && data.subjectName) {
      const subject = await subjectService.findOrCreate(data.userId, data.subjectName);
      subjectId = subject.id;
    }

    if (!subjectId) {
      throw new Error('Konu ID veya konu adı gerekli');
    }

    const session = await prisma.studySession.create({
      data: {
        userId: data.userId,
        subjectId,
        date: new Date(),
        duration: data.duration,
        notes: data.notes || null,
      },
      include: { subject: true },
    });

    // Update user totalStudyMinutes
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        totalStudyMinutes: { increment: data.duration },
      },
    });

    // Calculate today's total study minutes
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySessions = await prisma.studySession.findMany({
      where: {
        userId: data.userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: { duration: true },
    });

    const todayTotalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    return { session, todayTotalMinutes };
  }

  async getByUser(userId: string, limit = 50) {
    return prisma.studySession.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getToday(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: { subject: true },
      orderBy: { date: 'desc' },
    });
  }
}

export const studySessionService = new StudySessionService();
