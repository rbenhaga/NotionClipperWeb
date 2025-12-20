/**
 * Stripe Routes
 * Payment and subscription management endpoints
 * 🔒 SECURITY: Rate limited to prevent abuse
 */

import { Router } from 'express';
import {
  createCheckout,
  createPortal,
  syncSubscription,
  verifySession,
  getPaymentMethod,
  reactivateSubscription,
  getBetaSpots,
} from '../controllers/stripe.controller.js';
import { authenticateToken, authenticateOptional } from '../middleware/auth.middleware.js';
import { generalRateLimiter, authRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

/**
 * Create Stripe Checkout session
 * POST /api/stripe/create-checkout-session
 * Optional auth - guests can checkout too
 * 🔒 SECURITY: Strict rate limit to prevent checkout spam
 */
router.post('/create-checkout-session', authRateLimiter, authenticateOptional, createCheckout);

/**
 * Create Stripe Customer Portal session
 * POST /api/stripe/create-portal
 * Requires authentication
 */
router.post('/create-portal', generalRateLimiter, authenticateToken, createPortal);

/**
 * Sync subscription from Stripe (manual webhook alternative)
 * POST /api/stripe/sync-subscription
 * Requires authentication
 */
router.post('/sync-subscription', generalRateLimiter, authenticateToken, syncSubscription);

/**
 * Verify checkout session and activate subscription
 * POST /api/stripe/verify-session
 * Requires authentication
 */
router.post('/verify-session', generalRateLimiter, authenticateToken, verifySession);

/**
 * Get payment method info
 * GET /api/stripe/payment-method
 * Requires authentication
 */
router.get('/payment-method', generalRateLimiter, authenticateToken, getPaymentMethod);

/**
 * Reactivate canceled subscription
 * POST /api/stripe/reactivate-subscription
 * Requires authentication
 */
router.post('/reactivate-subscription', generalRateLimiter, authenticateToken, reactivateSubscription);

/**
 * Get remaining beta spots
 * GET /api/stripe/beta-spots
 * Public endpoint - no auth required
 */
router.get('/beta-spots', generalRateLimiter, getBetaSpots);

export default router;