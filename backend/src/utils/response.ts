/**
 * API Response Utilities
 * Standardized response formatters
 */

import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/index.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = HTTP_STATUS.OK,
  meta?: Record<string, any>
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date(),
      ...meta,
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code?: string,
  details?: any
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      timestamp: new Date(),
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    meta: {
      timestamp: new Date(),
    },
  };

  return res.status(HTTP_STATUS.OK).json(response);
}

/**
 * Send created response (201)
 */
export function sendCreated<T>(res: Response, data: T, meta?: Record<string, any>): Response {
  return sendSuccess(res, data, HTTP_STATUS.CREATED, meta);
}

/**
 * Send no content response (204)
 */
export function sendNoContent(res: Response): Response {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}

/**
 * Send unauthorized response (401)
 */
export function sendUnauthorized(res: Response, message?: string): Response {
  return sendError(
    res,
    message || 'Unauthorized',
    HTTP_STATUS.UNAUTHORIZED,
    'UNAUTHORIZED'
  );
}

/**
 * Send forbidden response (403)
 */
export function sendForbidden(res: Response, message?: string): Response {
  return sendError(
    res,
    message || 'Forbidden',
    HTTP_STATUS.FORBIDDEN,
    'FORBIDDEN'
  );
}

/**
 * Send not found response (404)
 */
export function sendNotFound(res: Response, message?: string): Response {
  return sendError(
    res,
    message || 'Resource not found',
    HTTP_STATUS.NOT_FOUND,
    'NOT_FOUND'
  );
}

/**
 * Send validation error response (400)
 */
export function sendValidationError(res: Response, details: any): Response {
  return sendError(
    res,
    'Validation error',
    HTTP_STATUS.BAD_REQUEST,
    'VALIDATION_ERROR',
    details
  );
}

/**
 * Send conflict response (409)
 */
export function sendConflict(res: Response, message: string, details?: any): Response {
  return sendError(
    res,
    message,
    HTTP_STATUS.CONFLICT,
    'CONFLICT',
    details
  );
}

/**
 * Send rate limit exceeded response (429)
 */
export function sendRateLimitExceeded(res: Response): Response {
  return sendError(
    res,
    'Too many requests, please try again later',
    HTTP_STATUS.TOO_MANY_REQUESTS,
    'RATE_LIMIT_EXCEEDED'
  );
}
