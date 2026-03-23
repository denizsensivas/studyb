import { EducationLevel } from '@prisma/client';
import prisma from '../prisma/client';

export class LeaderboardService {
  async getGlobal(sortBy: 'questions' | 'streak' | 'studyTime' = 'questions', limit = 50) {
    const orderBy: any = {};
    if (sortBy === 'streak') orderBy.streak = 'desc';
    else if (sortBy === 'studyTime') orderBy.totalStudyMinutes = 'desc';
    else orderBy.totalQuestions = 'desc';

    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        educationLevel: true,
        totalQuestions: true,
        totalStudyMinutes: true,
        streak: true,
      } as any,
      orderBy: [orderBy, { totalQuestions: 'desc' }],
      take: limit,
    });
  }

  async getByLevel(level: EducationLevel, sortBy: 'questions' | 'streak' | 'studyTime' = 'questions', limit = 50) {
    const orderBy: any = {};
    if (sortBy === 'streak') orderBy.streak = 'desc';
    else if (sortBy === 'studyTime') orderBy.totalStudyMinutes = 'desc';
    else orderBy.totalQuestions = 'desc';

    return prisma.user.findMany({
      where: { educationLevel: level },
      select: {
        id: true,
        name: true,
        educationLevel: true,
        totalQuestions: true,
        totalStudyMinutes: true,
        streak: true,
      } as any,
      orderBy: [orderBy, { totalQuestions: 'desc' }],
      take: limit,
    });
  }
}

export const leaderboardService = new LeaderboardService();
