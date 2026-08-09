import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  educationLevel: z.enum(['PRIMARY_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY']),
});

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gerekli'),
});

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.post('/test-login', (req, res) => authController.testLogin(req, res));
router.get('/profile', authMiddleware, (req, res) => authController.getProfile(req, res));
router.patch('/preferences', authMiddleware, (req, res) => authController.updatePreferences(req, res));

export default router;
