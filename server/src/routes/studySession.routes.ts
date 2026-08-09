import { Router } from 'express';
import { z } from 'zod';
import { studySessionController } from '../controllers/studySession.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  subjectId: z.string().uuid().optional(),
  subjectName: z.string().min(1).optional(),
  duration: z.number().int().min(1, 'Süre en az 1 dakika olmalı'),
  notes: z.string().optional(),
}).refine(
  (data) => data.subjectId || data.subjectName,
  { message: 'subjectId veya subjectName gerekli' }
);

router.post('/', authMiddleware, validate(createSchema), (req, res) => studySessionController.create(req, res));
router.get('/', authMiddleware, (req, res) => studySessionController.getByUser(req, res));
router.get('/today', authMiddleware, (req, res) => studySessionController.getToday(req, res));

export default router;
