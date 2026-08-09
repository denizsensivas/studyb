import fs from 'fs';
import path from 'path';
import prisma from '../prisma/client';

export class DocumentService {
  async getByUser(userId: string) {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
  }) {
    return prisma.document.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
    });
  }

  async delete(id: string, userId: string) {
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      throw new Error('Dosya bulunamadı');
    }

    if (doc.userId !== userId) {
      throw new Error('Bu dosyayı silmeye yetkiniz yok');
    }

    // Delete from DB
    await prisma.document.delete({
      where: { id },
    });

    // Delete from disk
    const absolutePath = path.resolve(doc.filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error('Failed to delete file from disk:', err);
      }
    }

    return { success: true };
  }
}

export const documentService = new DocumentService();
