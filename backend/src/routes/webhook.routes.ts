/**
 * Webhook Routes
 * External webhook endpoints (Stripe, etc.)
 */

import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../controllers/stripe.controller.js';
import { stripeWebhookRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

/**
 * Stripe Webhook
 * POST /api/webhooks/stripe
 *
 * IMPORTANT: Must use raw body for signature verification
 */
router.post(
  '/stripe',
  stripeWebhookRateLimiter,
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
