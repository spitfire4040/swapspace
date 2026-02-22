import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) {
      return next(createError(400, body.error.issues.map((i) => i.message).join(', ')));
    }

    const { user, tokens } = await authService.register(
      body.data.email,
      body.data.username,
      body.data.password
    );

    res.status(201).json({ user, ...tokens });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === '23505'
    ) {
      return next(createError(409, 'Email or username already in use'));
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      return next(createError(400, 'Invalid request body'));
    }

    const { user, tokens } = await authService.login(body.data.email, body.data.password);
    res.json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = refreshSchema.safeParse(req.body);
    if (!body.success) {
      return next(createError(400, 'refreshToken is required'));
    }

    const tokens = await authService.refresh(body.data.refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = refreshSchema.safeParse(req.body);
    if (!body.success) {
      return next(createError(400, 'refreshToken is required'));
    }

    await authService.logout(body.data.refreshToken);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}
