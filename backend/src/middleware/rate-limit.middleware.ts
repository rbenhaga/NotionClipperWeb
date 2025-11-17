/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request rates
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { RATE_LIMITS } from '../config/constants.js';
import { sendRateLimitExceeded } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * General rate limiter
 */
export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
  max: RATE_LIMITS.GENERAL.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    sendRateLimitExceeded(res);
  },
  skip: (_req) => {
    // Skip rate limiting in development (optional)
    return config.env === 'development';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    sendRateLimitExceeded(res);
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Rate limiter for Stripe webhooks
 * More lenient as Stripe sends multiple webhooks
 */
export const stripeWebhookRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.STRIPE_WEBHOOK.WINDOW_MS,
  max: RATE_LIMITS.STRIPE_WEBHOOK.MAX_REQUESTS,
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Stripe webhook rate limit exceeded for IP: ${req.ip}`);
    sendRateLimitExceeded(res);
  },
});

/**
 * Custom rate limiter factory
 * Create custom rate limiters with specific config
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Custom rate limit exceeded for IP: ${req.ip}`);
      sendRateLimitExceeded(res);
    },
  });
}
