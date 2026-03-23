import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authMiddleware, (req, res) => analyticsController.getDashboard(req, res));

export default router;
