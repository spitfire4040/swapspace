import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import authRoutes from './routes/auth.routes';
import photoRoutes from './routes/photo.routes';
import swipeRoutes from './routes/swipe.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — must come before routes
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
    })
  );

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static file serving for uploads (UUID filenames, not guessable)
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      maxAge: '7d',
    })
  );

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/photos', photoRoutes);
  app.use('/api/v1/swipes', swipeRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler — must be last
  app.use(errorHandler);

  return app;
}
