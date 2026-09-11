import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import subjectRoutes from './routes/subject.routes';
import dailyEntryRoutes from './routes/dailyEntry.routes';
import pomodoroRoutes from './routes/pomodoro.routes';
import examRoutes from './routes/exam.routes';
import analyticsRoutes from './routes/analytics.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import documentRoutes from './routes/document.routes';
import studySessionRoutes from './routes/studySession.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/daily-entry', dailyEntryRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/study-sessions', studySessionRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve custom alarm audio securely
app.get('/api/audio/alarm', (req, res) => {
  const dest = req.headers['sec-fetch-dest'];
  // Prevent direct browser URL access
  if (dest === 'document') {
    return res.status(403).json({ error: 'Direct access forbidden' });
  }

  const audioPath = path.join(__dirname, '../sounds', 'alarm.mp3');
  res.sendFile(audioPath, (err) => {
    if (err) {
      res.status(404).end();
    }
  });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Handle client-side routing
  app.get('*', (req, res, next) => {
    // If it's an API route that somehow got here, pass it to error handler or skip
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Try to serve index.html for any other route (React Router)
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Study Buddy API running on http://localhost:${env.PORT}`);
});

export default app;
