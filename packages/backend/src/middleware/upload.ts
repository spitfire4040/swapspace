import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError(400, 'Only JPEG, PNG, and WebP images are allowed') as unknown as null, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Validates the actual file content by reading magic bytes.
 * Must be used after multer has parsed the upload.
 */
export async function validateFileType(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.file) return next();

  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const result = await fileTypeFromBuffer(req.file.buffer);

    if (!result || !ALLOWED_MIME_TYPES.includes(result.mime)) {
      return next(createError(400, 'Only JPEG, PNG, and WebP images are allowed'));
    }

    // Overwrite the client-supplied mimetype with the detected one
    req.file.mimetype = result.mime;
    next();
  } catch {
    return next(createError(400, 'Unable to determine file type'));
  }
}
