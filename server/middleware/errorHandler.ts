import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);

  if (config.nodeEnv !== 'production') {
    console.error(err.stack);
  }

  res.status(500).json({
    ok: false,
    error: config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message,
  });
}
