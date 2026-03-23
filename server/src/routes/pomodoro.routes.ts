import { Router } from 'express';
import { z } from 'zod';
import { pomodoroController } from '../controllers/pomodoro.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  duration: z.number().int().min(1, 'Süre en az 1 dakika olmalı'),
});

router.post('/', authMiddleware, validate(createSchema), (req, res) => pomodoroController.create(req, res));
router.get('/', authMiddleware, (req, res) => pomodoroController.getAll(req, res));
router.get('/stats', authMiddleware, (req, res) => pomodoroController.getStats(req, res));

export default router;
