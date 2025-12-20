/**
 * Error Handling Middleware
 * Centralized error handling for the entire application
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';
import { HTTP_STATUS } from '../config/constants.js';
import { sendError } from '../utils/response.js';
import { logError } from '../utils/logger.js';
import { isDevelopment } from '../config/index.js';

/**
 * Global error handler middleware
 * Must be last middleware in the chain
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logError(err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // AppError (known errors)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // Validation errors (Zod, etc.)
  if (err.name === 'ValidationError') {
    sendError(
      res,
      'Validation error',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
      isDevelopment ? err.message : undefined
    );
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(
      res,
      'Invalid token',
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_TOKEN'
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(
      res,
      'Token expired',
      HTTP_STATUS.UNAUTHORIZED,
      'TOKEN_EXPIRED'
    );
    return;
  }

  // Stripe errors
  if (err.constructor.name === 'StripeError') {
    sendError(
      res,
      'Payment processing error',
      HTTP_STATUS.BAD_REQUEST,
      'STRIPE_ERROR',
      isDevelopment ? err.message : undefined
    );
    return;
  }

  // 🔒 SECURITY: Supabase/PostgREST error mapping
  // Map database errors to appropriate HTTP status codes
  const errWithCode = err as Error & { code?: string };
  if (errWithCode.code && typeof errWithCode.code === 'string') {
    const supabaseErrorMap: Record<string, { status: number; message: string; code: string }> = {
      'PGRST116': { status: HTTP_STATUS.NOT_FOUND, message: 'Resource not found', code: 'NOT_FOUND' },
      'PGRST204': { status: HTTP_STATUS.NOT_FOUND, message: 'Resource not found', code: 'NOT_FOUND' },
      'PGRST205': { status: 503, message: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' },
      '23505': { status: 409, message: 'Resource already exists', code: 'CONFLICT' },
      '23503': { status: HTTP_STATUS.BAD_REQUEST, message: 'Invalid reference', code: 'INVALID_REFERENCE' },
      '42P01': { status: 503, message: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' },
      '42501': { status: 403, message: 'Permission denied', code: 'FORBIDDEN' },
    };
    
    const mapped = supabaseErrorMap[errWithCode.code];
    if (mapped) {
      sendError(res, mapped.message, mapped.status, mapped.code);
      return;
    }
  }

  // Default internal server error
  sendError(
    res,
    isDevelopment ? err.message : 'Internal server error',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'INTERNAL_ERROR',
    isDevelopment ? { stack: err.stack } : undefined
  );
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  sendError(
    res,
    `Route not found: ${req.method} ${req.url}`,
    HTTP_STATUS.NOT_FOUND,
    'NOT_FOUND'
  );
}

/**
 * Async error wrapper
 * Catches errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
