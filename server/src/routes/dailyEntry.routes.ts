import { Router } from 'express';
import { z } from 'zod';
import { dailyEntryController } from '../controllers/dailyEntry.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  subjectId: z.string().uuid().optional(),
  subjectName: z.string().min(1).optional(),
  correct: z.number().int().min(0),
  wrong: z.number().int().min(0),
}).refine(
  (data) => data.subjectId || data.subjectName,
  { message: 'subjectId veya subjectName gerekli' }
);

router.post('/', authMiddleware, validate(createSchema), (req, res) => dailyEntryController.create(req, res));
router.get('/', authMiddleware, (req, res) => dailyEntryController.getByUser(req, res));
router.get('/today', authMiddleware, (req, res) => dailyEntryController.getToday(req, res));

export default router;
