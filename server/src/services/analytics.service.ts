import prisma from '../prisma/client';

export class AnalyticsService {
  async getDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      user,
      todayEntries,
      weekEntries,
      allTimeEntries,
      todayPomodoros,
      weekPomodoros,
      allTimePomodoros,
      recentEntries,
      subjectBreakdown,
      examStats,
      pomodoroBreakdown,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          streak: true,
          totalQuestions: true,
          lastActiveDate: true,
          educationLevel: true,
        },
      }),
      prisma.dailyEntry.aggregate({
        where: { userId, date: { gte: today } },
        _sum: { correct: true, wrong: true },
        _count: true,
      }),
      prisma.dailyEntry.aggregate({
        where: { userId, date: { gte: weekAgo } },
        _sum: { correct: true, wrong: true },
        _count: true,
      }),
      prisma.dailyEntry.aggregate({
        where: { userId },
        _sum: { correct: true, wrong: true },
        _count: true,
      }),
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
      prisma.dailyEntry.findMany({
        where: { userId, date: { gte: weekAgo } },
        include: { subject: true },
        orderBy: { date: 'desc' },
      }),
      prisma.dailyEntry.groupBy({
        by: ['subjectId'],
        where: { userId },
        _sum: { correct: true, wrong: true },
        _count: true,
      }),
      prisma.questionTime.aggregate({
        where: { examSession: { userId } },
        _avg: { timeSpent: true },
        _count: true,
      }),
      prisma.pomodoroSession.groupBy({
        by: ['subjectId' as any],
        where: { userId },
        _sum: { duration: true },
        _count: true,
      }) as any,
    ]);



    // Fetch subject names for breakdown
    const subjectIds = [...new Set([
      ...subjectBreakdown.map((s: any) => s.subjectId),
      ...pomodoroBreakdown.map((p: any) => p.subjectId).filter((id: any): id is string => id !== null)
    ])];


    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true },
    });

    const subjectStats = subjectBreakdown.map((stat: any) => {
      const subject = subjects.find((s: { id: string }) => s.id === stat.subjectId);
      const correct = stat._sum?.correct || 0;
      const wrong = stat._sum?.wrong || 0;

      const total = correct + wrong;
      return {
        subjectId: stat.subjectId,
        subjectName: subject?.name || 'Bilinmeyen',
        correct,
        wrong,
        total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    }).sort((a: any, b: any) => b.total - a.total);

    const pomodoroStats = pomodoroBreakdown.map((stat: any) => {
      const subject = subjects.find((s: { id: string }) => s.id === stat.subjectId);
      return {
        subjectId: stat.subjectId,
        subjectName: subject?.name || 'Konusuz',
        totalMinutes: stat._sum?.duration || 0,
        sessionCount: stat._count,
      };
    }).sort((a: any, b: any) => (b.totalMinutes || 0) - (a.totalMinutes || 0));


    // Group entries by date for chart data
    const dailyStats = this.groupByDate(recentEntries);

    return {
      streak: user?.streak || 0,
      totalQuestions: user?.totalQuestions || 0,
      today: {
        correct: todayEntries._sum.correct || 0,
        wrong: todayEntries._sum.wrong || 0,
        total: (todayEntries._sum.correct || 0) + (todayEntries._sum.wrong || 0),
        entries: todayEntries._count,
        pomodoroCount: todayPomodoros._count,
        studyMinutes: todayPomodoros._sum.duration || 0,
      },
      week: {
        correct: weekEntries._sum.correct || 0,
        wrong: weekEntries._sum.wrong || 0,
        total: (weekEntries._sum.correct || 0) + (weekEntries._sum.wrong || 0),
        entries: weekEntries._count,
        pomodoroCount: weekPomodoros._count,
        studyMinutes: weekPomodoros._sum.duration || 0,
      },
      allTime: {
        correct: allTimeEntries._sum.correct || 0,
        wrong: allTimeEntries._sum.wrong || 0,
        total: (allTimeEntries._sum.correct || 0) + (allTimeEntries._sum.wrong || 0),
        entries: allTimeEntries._count,
        pomodoroCount: allTimePomodoros._count,
        studyMinutes: allTimePomodoros._sum.duration || 0,
      },
      subjectStats,
      pomodoroStats,
      examStats: {
        avgTimePerQuestion: Math.round(examStats._avg.timeSpent || 0),
        totalQuestionsTimed: examStats._count,
      },
      dailyStats,
    };
  }

  private groupByDate(entries: any[]) {
    const dailyStats: any[] = [];
    const now = new Date();
    
    // Generate last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyStats.push({
        date: dateKey,
        correct: 0,
        wrong: 0,
        total: 0,
      });
    }

    for (const entry of entries) {
      const d = new Date(entry.date);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayStat = dailyStats.find(s => s.date === dateKey);
      if (dayStat) {
        dayStat.correct += entry.correct;
        dayStat.wrong += entry.wrong;
        dayStat.total += entry.correct + entry.wrong;
      }
    }

    return dailyStats;
  }
}

export const analyticsService = new AnalyticsService();
