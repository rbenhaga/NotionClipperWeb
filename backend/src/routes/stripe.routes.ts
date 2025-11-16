/**
 * Stripe Routes
 * Payment and subscription management endpoints
 */

import { Router } from 'express';
import {
  createCheckout,
  createPortal,
} from '../controllers/stripe.controller.js';
import { authenticateToken, authenticateOptional } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Create Stripe Checkout session
 * POST /api/stripe/create-checkout-session
 * Optional auth - guests can checkout too
 */
router.post('/create-checkout-session', authenticateOptional, createCheckout);

/**
 * Create Stripe Customer Portal session
 * POST /api/stripe/create-portal
 * Requires authentication
 */
router.post('/create-portal', authenticateToken, createPortal);

export default router;