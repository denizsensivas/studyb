import { Router } from 'express';
import { z } from 'zod';
import { subjectController } from '../controllers/subject.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1, 'Konu adı gerekli'),
});

router.get('/', authMiddleware, (req, res) => subjectController.getAll(req, res));
router.get('/search', authMiddleware, (req, res) => subjectController.search(req, res));
router.post('/', authMiddleware, validate(createSchema), (req, res) => subjectController.create(req, res));

export default router;
