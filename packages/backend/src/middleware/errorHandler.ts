import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? 500;
  const message = err.message ?? 'Internal Server Error';
  console.error(`[${status}] ${message}`);
  res.status(status).json({ error: message });
}

export function createError(status: number, message: string): AppError {
  const err: AppError = new Error(message);
  err.status = status;
  return err;
}
