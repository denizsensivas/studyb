import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { documentService } from '../services/document.service';

function documentErrorStatus(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('yapılandırılmamış')) return 503;
  if (message.includes('yeterli yer yok')) return 507;
  if (message.includes('yetkiniz')) return 403;
  if (message.includes('bulunamadı')) return 404;
  return 500;
}

function documentErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
}

export class DocumentController {
  async getStorageUsage(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const usage = await documentService.getStorageUsage();
      res.json(usage);
    } catch (error: unknown) {
      res.status(documentErrorStatus(error)).json({ error: documentErrorMessage(error) });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const docs = await documentService.getByUser(req.userId!);
      res.json(docs);
    } catch (error: unknown) {
      res.status(documentErrorStatus(error)).json({ error: documentErrorMessage(error) });
    }
  }

  async upload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Lütfen bir dosya yükleyin' });
        return;
      }

      const { title } = req.body;
      const doc = await documentService.create({
        userId: req.userId!,
        title: title || req.file.originalname,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        contents: req.file.buffer,
      });

      res.status(201).json(doc);
    } catch (error: unknown) {
      res.status(documentErrorStatus(error)).json({ error: documentErrorMessage(error) });
    }
  }

  async download(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { doc, contents } = await documentService.download(id, req.userId!);
      const encodedFileName = encodeURIComponent(doc.fileName);

      res.setHeader('Content-Type', doc.mimeType);
      res.setHeader('Content-Length', contents.length);
      res.setHeader('Content-Disposition', `inline; filename="document"; filename*=UTF-8''${encodedFileName}`);
      res.setHeader('Cache-Control', 'private, no-store');
      res.send(contents);
    } catch (error: unknown) {
      res.status(documentErrorStatus(error)).json({ error: documentErrorMessage(error) });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await documentService.delete(id, req.userId!);
      res.json(result);
    } catch (error: unknown) {
      res.status(documentErrorStatus(error)).json({ error: documentErrorMessage(error) });
    }
  }
}

export const documentController = new DocumentController();
