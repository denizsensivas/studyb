import prisma from '../prisma/client';

export class ExamService {
  async create(userId: string, data: {
    totalDuration: number;
    questions: { questionNo: number; timeSpent: number }[];
  }) {
    return prisma.examSession.create({
      data: {
        userId,
        totalDuration: data.totalDuration,
        questions: {
          create: data.questions.map((q) => ({
            questionNo: q.questionNo,
            timeSpent: q.timeSpent,
          })),
        },
      },
      include: { questions: { orderBy: { questionNo: 'asc' } } },
    });
  }

  async getByUser(userId: string, limit = 20) {
    return prisma.examSession.findMany({
      where: { userId },
      include: { questions: { orderBy: { questionNo: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getById(id: string, userId: string) {
    const session = await prisma.examSession.findUnique({
      where: { id },
      include: { questions: { orderBy: { questionNo: 'asc' } } },
    });
    if (!session || session.userId !== userId) {
      throw new Error('Sınav oturumu bulunamadı');
    }
    return session;
  }
}

export const examService = new ExamService();
