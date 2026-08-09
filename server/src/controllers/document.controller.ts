import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { documentService } from '../services/document.service';
import fs from 'fs';
import path from 'path';

export class DocumentController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const docs = await documentService.getByUser(req.userId!);
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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
        filePath: req.file.path,
      });

      res.status(201).json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async download(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doc = await documentService.findById(id);

      if (!doc) {
        res.status(404).json({ error: 'Dosya bulunamadı' });
        return;
      }

      if (doc.userId !== req.userId!) {
        res.status(403).json({ error: 'Bu dosyaya erişim yetkiniz yok' });
        return;
      }

      const absolutePath = path.resolve(doc.filePath);
      if (!fs.existsSync(absolutePath)) {
        res.status(404).json({ error: 'Dosya sunucuda bulunamadı' });
        return;
      }

      res.sendFile(absolutePath, {
        headers: {
          'Content-Disposition': `inline; filename="${encodeURIComponent(doc.fileName)}"`,
          'Content-Type': doc.mimeType
        }
      }, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Dosya gönderilirken hata oluştu' });
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await documentService.delete(id, req.userId!);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const documentController = new DocumentController();
