import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { AppError } from '../types/index.js';

export function notionDegradedGuard(req: Request, _res: Response, next: NextFunction): void {
  if (!config.featureFlags.notionDegradedMode) {
    next();
    return;
  }

  const isStatusCheck = req.path.includes('/status') || req.path.includes('/result');
  if (isStatusCheck) {
    next();
    return;
  }

  const retryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const error = new AppError('Service degraded. Please retry later.', 503, 'SERVICE_DEGRADED', { retryAt });
  (error as AppError & { retryAt?: string }).retryAt = retryAt;
  next(error);
}
