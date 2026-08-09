import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async testLogin(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.testLogin();
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async updatePreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.updatePreferences(req.userId!, req.body.preferences);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const authController = new AuthController();
