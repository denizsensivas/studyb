import { EducationLevel } from '@prisma/client';
import prisma from '../prisma/client';
import { getLeaderboardVersion, getOrSetCache } from '../redis/cache';

export class LeaderboardService {
  async getGlobal(sortBy: 'questions' | 'streak' | 'studyTime' = 'questions', limit = 50) {
    const orderBy: any = {};
    if (sortBy === 'streak') orderBy.streak = 'desc';
    else if (sortBy === 'studyTime') orderBy.totalStudyMinutes = 'desc';
    else orderBy.totalQuestions = 'desc';

    const version = await getLeaderboardVersion();
    return getOrSetCache(`leaderboard:${version}:global:${sortBy}:${limit}`, () => prisma.user.findMany({
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
    }), 30);
  }

  async getByLevel(level: EducationLevel, sortBy: 'questions' | 'streak' | 'studyTime' = 'questions', limit = 50) {
    const orderBy: any = {};
    if (sortBy === 'streak') orderBy.streak = 'desc';
    else if (sortBy === 'studyTime') orderBy.totalStudyMinutes = 'desc';
    else orderBy.totalQuestions = 'desc';

    const version = await getLeaderboardVersion();
    return getOrSetCache(`leaderboard:${version}:level:${level}:${sortBy}:${limit}`, () => prisma.user.findMany({
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
    }), 30);
  }
}

export const leaderboardService = new LeaderboardService();
