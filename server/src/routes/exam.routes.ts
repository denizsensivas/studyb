import { Router } from 'express';
import { z } from 'zod';
import { examController } from '../controllers/exam.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  totalDuration: z.number().int().min(1),
  questions: z.array(z.object({
    questionNo: z.number().int().min(1),
    timeSpent: z.number().int().min(0),
  })).min(1, 'En az 1 soru gerekli'),
});

router.post('/', authMiddleware, validate(createSchema), (req, res) => examController.create(req, res));
router.get('/', authMiddleware, (req, res) => examController.getAll(req, res));
router.get('/:id', authMiddleware, (req, res) => examController.getById(req, res));

export default router;
