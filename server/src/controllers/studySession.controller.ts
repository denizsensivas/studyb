import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { studySessionService } from '../services/studySession.service';

export class StudySessionController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await studySessionService.create({
        userId: req.userId!,
        ...req.body,
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sessions = await studySessionService.getByUser(req.userId!);
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getToday(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sessions = await studySessionService.getToday(req.userId!);
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const studySessionController = new StudySessionController();
