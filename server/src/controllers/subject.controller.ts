import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { subjectService } from '../services/subject.service';

export class SubjectController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const subjects = await subjectService.getByUser(req.userId!);
      res.json(subjects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async search(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const subjects = await subjectService.search(req.userId!, query);
      res.json(subjects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      const subject = await subjectService.create(req.userId!, name);
      res.status(201).json(subject);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const subjectController = new SubjectController();
