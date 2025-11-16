/**
 * Stripe Controllers
 * Handles Stripe payment flows and webhooks
 */

import { Request, Response, NextFunction } from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  constructWebhookEvent,
} from '../services/stripe.service.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AuthenticatedRequest, AppError } from '../types/index.js';
import { config } from '../config/index.js';

/**
 * POST /api/stripe/create-checkout
 * Create Stripe Checkout session for Premium upgrade
 */
export const createCheckout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { successUrl, cancelUrl } = req.body;

    if (!successUrl || !cancelUrl) {
      throw new AppError('successUrl and cancelUrl are required', 400);
    }

    const session = await createCheckoutSession(
      req.user.userId,
      successUrl,
      cancelUrl
    );

    logger.info(`Checkout session created for user: ${req.user.userId}`);

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
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
