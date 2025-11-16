/**
 * Stripe Routes
 * Payment and subscription management endpoints
 */

import { Router } from 'express';
import {
  createCheckout,
  createPortal,
} from '../controllers/stripe.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All Stripe routes require authentication
router.use(authenticateToken);

/**
 * Create Stripe Checkout session
 * POST /api/stripe/create-checkout
 */
router.post('/create-checkout', createCheckout);

/**
 * Create Stripe Customer Portal session
 * POST /api/stripe/create-portal
 */
router.post('/create-portal', createPortal);

export default router;
