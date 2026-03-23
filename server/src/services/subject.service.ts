import prisma from '../prisma/client';

export class SubjectService {
  async getByUser(userId: string) {
    return prisma.subject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(userId: string, query: string) {
    return prisma.subject.findMany({
      where: {
        userId,
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async create(userId: string, name: string) {
    const existing = await prisma.subject.findUnique({
      where: { name_userId: { name, userId } },
    });
    if (existing) return existing;

    return prisma.subject.create({
      data: { name, userId },
    });
  }

  async findOrCreate(userId: string, name: string) {
    const existing = await prisma.subject.findUnique({
      where: { name_userId: { name, userId } },
    });
    if (existing) return existing;

    return prisma.subject.create({
      data: { name, userId },
    });
  }
}

export const subjectService = new SubjectService();
