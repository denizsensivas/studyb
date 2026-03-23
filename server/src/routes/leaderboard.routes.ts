import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/global', authMiddleware, (req, res) => leaderboardController.getGlobal(req, res));
router.get('/level/:level', authMiddleware, (req, res) => leaderboardController.getByLevel(req, res));

export default router;
