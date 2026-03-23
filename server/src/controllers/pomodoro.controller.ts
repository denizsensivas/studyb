import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pomodoroService } from '../services/pomodoro.service';

export class PomodoroController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { duration, subjectId, subjectName } = req.body;
      const session = await pomodoroService.create(req.userId!, duration, subjectId, subjectName);
      res.status(201).json(session);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sessions = await pomodoroService.getByUser(req.userId!);
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await pomodoroService.getStats(req.userId!);
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const pomodoroController = new PomodoroController();
