import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { examService } from '../services/exam.service';

export class ExamController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const session = await examService.create(req.userId!, req.body);
      res.status(201).json(session);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sessions = await examService.getByUser(req.userId!);
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const session = await examService.getById(req.params.id, req.userId!);
      res.json(session);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
}

export const examController = new ExamController();
