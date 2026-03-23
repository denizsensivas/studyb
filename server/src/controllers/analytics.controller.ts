import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getDashboard(req.userId!);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const analyticsController = new AnalyticsController();
