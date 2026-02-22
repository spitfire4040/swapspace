import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as swipeService from '../services/swipe.service';
import { createError } from '../middleware/errorHandler';

const swipeSchema = z.object({
  photoId: z.string().uuid(),
  direction: z.enum(['like', 'skip']),
});

export async function createSwipe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = swipeSchema.safeParse(req.body);
    if (!body.success) {
      return next(createError(400, body.error.issues.map((i) => i.message).join(', ')));
    }

    const swipe = await swipeService.recordSwipe(
      req.user!.userId,
      body.data.photoId,
      body.data.direction
    );
    res.status(201).json(swipe);
  } catch (err) {
    next(err);
  }
}

export async function getLikedSwipes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const swipes = await swipeService.getLikedSwipes(req.user!.userId);
    res.json({ swipes });
  } catch (err) {
    next(err);
  }
}
