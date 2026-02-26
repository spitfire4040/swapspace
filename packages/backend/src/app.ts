import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import photoRoutes from './routes/photo.routes';
import swipeRoutes from './routes/swipe.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — must come before routes
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin header (native apps, curl, same-origin)
        // but reject literal "null" string origin (e.g. sandboxed iframes)
        if (origin === undefined || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
