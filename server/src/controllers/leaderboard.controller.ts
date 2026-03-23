import { Request, Response } from 'express';
import { EducationLevel } from '@prisma/client';
import { leaderboardService } from '../services/leaderboard.service';

export class LeaderboardController {
  async getGlobal(req: Request, res: Response): Promise<void> {
    try {
      const { sortBy } = req.query;
      const leaderboard = await leaderboardService.getGlobal(sortBy as any);
      res.json(leaderboard);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getByLevel(req: Request, res: Response): Promise<void> {
    try {
      const { sortBy } = req.query;
      const level = req.params.level as EducationLevel;
      if (!Object.values(EducationLevel).includes(level)) {
        res.status(400).json({ error: 'Geçersiz eğitim seviyesi' });
        return;
      }
      const leaderboard = await leaderboardService.getByLevel(level, sortBy as any);
      res.json(leaderboard);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const leaderboardController = new LeaderboardController();
