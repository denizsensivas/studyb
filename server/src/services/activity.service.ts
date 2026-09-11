import prisma from '../prisma/client';

/**
 * Records a user's study activity and keeps the daily streak up to date.
 * Any completed study activity counts: question entries, Pomodoro sessions,
 * and exam sessions.
 */
export class ActivityService {
  async record(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = user.streak;

    if (!user.lastActiveDate) {
      streak = 1;
    } else {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        streak,
        lastActiveDate: new Date(),
      },
    });
  }
}

export const activityService = new ActivityService();
