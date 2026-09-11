import { randomUUID } from 'crypto';
import path from 'path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { env } from '../config/env';
import prisma from '../prisma/client';

const missingR2Variables = () => [
  ['R2_ACCOUNT_ID', env.R2_ACCOUNT_ID],
  ['R2_ACCESS_KEY_ID', env.R2_ACCESS_KEY_ID],
  ['R2_SECRET_ACCESS_KEY', env.R2_SECRET_ACCESS_KEY],
  ['R2_BUCKET_NAME', env.R2_BUCKET_NAME],
].filter(([, value]) => !value).map(([name]) => name);

let r2Client: S3Client | null = null;

const publicDocumentFields = {
  id: true,
  title: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  createdAt: true,
} as const;

// Keep a 1 GB safety margin below R2's 10 GB-month free storage allowance.
// This lock serializes quota checks across every server instance without
// affecting document reads, downloads, or deletes.
const DOCUMENT_STORAGE_LIMIT_BYTES = 9_000_000_000;
const DOCUMENT_STORAGE_LOCK_ID = 93_847_621;

function storageUsage(usedBytes: number) {
  const remainingBytes = Math.max(0, DOCUMENT_STORAGE_LIMIT_BYTES - usedBytes);

  return {
    usedBytes,
    limitBytes: DOCUMENT_STORAGE_LIMIT_BYTES,
    remainingBytes,
    usagePercent: Math.min(100, Number(((usedBytes / DOCUMENT_STORAGE_LIMIT_BYTES) * 100).toFixed(2))),
  };
}

function getR2Client() {
  const missing = missingR2Variables();
  if (missing.length > 0) {
    throw new Error(`Bulut depolama yapılandırılmamış: ${missing.join(', ')}`);
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

export class DocumentService {
  async getStorageUsage() {
    const result = await prisma.document.aggregate({
      _sum: { fileSize: true },
    });

    return storageUsage(result._sum.fileSize ?? 0);
  }

  async getByUser(userId: string) {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: publicDocumentFields,
    });
  }

  async create(data: {
    userId: string;
    title: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    contents: Buffer;
  }) {
    const extension = path.extname(data.fileName).toLowerCase();
    const storageKey = `users/${data.userId}/${randomUUID()}${extension}`;
    const client = getR2Client();
    let uploaded = false;

    try {
      return await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(${DOCUMENT_STORAGE_LOCK_ID})::text`;

        const result = await tx.document.aggregate({
          _sum: { fileSize: true },
        });
        const usedBytes = result._sum.fileSize ?? 0;

        if (usedBytes + data.fileSize > DOCUMENT_STORAGE_LIMIT_BYTES) {
          throw new Error('Paylaşılan bulut depolama alanında bu dosya için yeterli yer yok');
        }

        await client.send(new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: storageKey,
          Body: data.contents,
          ContentType: data.mimeType,
        }));
        uploaded = true;

        return tx.document.create({
          data: {
            userId: data.userId,
            title: data.title,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
            storageKey,
          },
          select: publicDocumentFields,
        });
      }, { timeout: 30_000 });
    } catch (error) {
      if (uploaded) {
        await client.send(new DeleteObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: storageKey,
        })).catch(() => undefined);
      }
      throw error;
    }
  }

  async download(id: string, userId: string) {
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) throw new Error('Dosya bulunamadı');
    if (doc.userId !== userId) throw new Error('Bu dosyaya erişim yetkiniz yok');

    const object = await getR2Client().send(new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: doc.storageKey,
    }));

    if (!object.Body) throw new Error('Dosya içeriği bulunamadı');

    return {
      doc,
      contents: Buffer.from(await object.Body.transformToByteArray()),
    };
  }

  async delete(id: string, userId: string) {
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) throw new Error('Dosya bulunamadı');
    if (doc.userId !== userId) throw new Error('Bu dosyayı silmeye yetkiniz yok');

    await getR2Client().send(new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: doc.storageKey,
    }));

    await prisma.document.delete({ where: { id } });

    return { success: true };
  }
}

export const documentService = new DocumentService();
