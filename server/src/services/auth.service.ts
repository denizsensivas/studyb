import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EducationLevel } from '@prisma/client';
import prisma from '../prisma/client';
import { env } from '../config/env';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    educationLevel: EducationLevel;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Bu e-posta adresi zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        educationLevel: data.educationLevel,
      },
      select: {
        id: true,
        name: true,
        email: true,
        educationLevel: true,
        streak: true,
        totalQuestions: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('E-posta veya şifre hatalı');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('E-posta veya şifre hatalı');
    }

    const token = this.generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async testLogin() {
    const testEmail = 'testuser@studyb.com';
    let user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('testpassword123', 12);
      user = await prisma.user.create({
        data: {
          name: 'Test Kullanıcısı',
          email: testEmail,
          password: hashedPassword,
          educationLevel: 'UNIVERSITY',
        },
      });
    }

    const token = this.generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        educationLevel: true,
        streak: true,
        lastActiveDate: true,
        totalQuestions: true,
        createdAt: true,
      },
    });
    if (!user) throw new Error('Kullanıcı bulunamadı');
    return user;
  }

  async updatePreferences(userId: string, preferences: any) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferences },
      select: {
        id: true,
        name: true,
        email: true,
        educationLevel: true,
        streak: true,
        lastActiveDate: true,
        totalQuestions: true,
        preferences: true,
        createdAt: true,
      },
    });
    return user;
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });
  }
}

export const authService = new AuthService();
