/**
 * CORS Middleware
 * Configures Cross-Origin Resource Sharing with allowed origins
 */

import cors from 'cors';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * CORS configuration
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (config.allowedOrigins.includes(origin)) {
      logger.debug(`CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`CORS: Blocking origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-User-Id',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
});
