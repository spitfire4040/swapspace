import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as photoService from '../services/photo.service';
import { createError } from '../middleware/errorHandler';

const unseenQuerySchema = z.object({
  limit: z.string().optional().transform((v) => Math.min(parseInt(v ?? '10', 10) || 10, 50)),
  cursor: z.string().optional(),
});

export async function uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) return next(createError(400, 'No photo file provided'));

    const caption = typeof req.body.caption === 'string' ? req.body.caption.trim() : undefined;
    const photo = await photoService.createPhoto(req.user!.userId, req.file, caption);
    res.status(201).json(photo);
  } catch (err) {
    next(err);
  }
}

export async function getUnseenPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = unseenQuerySchema.safeParse(req.query);
    if (!query.success) return next(createError(400, 'Invalid query params'));

    const photos = await photoService.getUnseenPhotos(
      req.user!.userId,
      query.data.limit,
      query.data.cursor
    );

    const nextCursor = photos.length > 0 ? photos[photos.length - 1].id : null;
    res.json({ photos, nextCursor });
  } catch (err) {
    next(err);
  }
}

export async function getLikedPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const photos = await photoService.getLikedPhotos(req.user!.userId);
    res.json({ photos });
  } catch (err) {
    next(err);
  }
}

export async function getMyPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const photos = await photoService.getMyPhotos(req.user!.userId);
    res.json({ photos });
  } catch (err) {
    next(err);
  }
}

export async function deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await photoService.deletePhoto(req.params.id, req.user!.userId);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
}
