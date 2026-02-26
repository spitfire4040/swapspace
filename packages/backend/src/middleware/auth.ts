import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { createError } from './errorHandler';

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(createError(401, 'Missing or invalid authorization header'));
  }

  const token = header.slice(7);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return next(createError(401, 'Invalid or expired access token'));
  }

  req.user = {
    userId: data.user.id,
    email: data.user.email!,
  };

  next();
}
