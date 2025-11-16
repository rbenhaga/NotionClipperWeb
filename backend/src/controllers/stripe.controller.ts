/**
 * Stripe Controllers
 * Handles Stripe payment flows and webhooks
 */

import { Request, Response } from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  constructWebhookEvent,
} from '../services/stripe.service.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AuthenticatedRequest, AppError } from '../types/index.js';
import { config } from '../config/index.js';

/**
 * POST /api/stripe/create-checkout-session
 * Create Stripe Checkout session for Premium upgrade
 * Body: { plan: 'premium_monthly' | 'premium_annual' | 'premium_onetime' }
 */
export const createCheckout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { plan } = req.body;

    // Validate plan parameter
    const validPlans = ['premium_monthly', 'premium_annual', 'premium_onetime'];
    if (!plan || !validPlans.includes(plan)) {
      throw new AppError(
        `Invalid plan. Must be one of: ${validPlans.join(', ')}`,
        400
      );
    }

    // Generate default success and cancel URLs
    const frontendUrl = config.frontendUrl || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/auth/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/pricing`;

    // Use userId from token if authenticated, otherwise use 'guest'
    const userId = req.user?.userId || 'guest';

    // Create checkout session via service
    const session = await createCheckoutSession(userId, plan, successUrl, cancelUrl);

    logger.info(`Checkout session created for ${userId !== 'guest' ? `user: ${userId}` : 'guest'}, plan: ${plan}`);

    sendSuccess(res, {
      sessionId: session.sessionId,
      url: session.url,
    });
  }
);

/**
 * POST /api/stripe/create-portal
 * Create Stripe Customer Portal session
 */
export const createPortal = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { returnUrl } = req.body;

    if (!returnUrl) {
      throw new AppError('returnUrl is required', 400);
    }

    const session = await createPortalSession(req.user.userId, returnUrl);

    logger.info(`Portal session created for user: ${req.user.userId}`);

    sendSuccess(res, {
      url: session.url,
    });
  }
);

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks
 */
export const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      throw new AppError('Missing Stripe signature', 400);
    }

    // Construct event from raw body
    const event = constructWebhookEvent(req.body, signature);

    logger.info(`Received Stripe webhook: ${event.type}`);

    // Process webhook event
    await handleWebhookEvent(event);

    // Return 200 immediately to acknowledge receipt
    res.json({ received: true });
  }
);
