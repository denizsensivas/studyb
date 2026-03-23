import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dailyEntryService } from '../services/dailyEntry.service';

export class DailyEntryController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const entry = await dailyEntryService.create({
        userId: req.userId!,
        ...req.body,
      });
      res.status(201).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const entries = await dailyEntryService.getByUser(req.userId!);
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getToday(req: AuthRequest, res: Response): Promise<void> {
    try {
      const entries = await dailyEntryService.getByDate(req.userId!, new Date());
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const dailyEntryController = new DailyEntryController();
