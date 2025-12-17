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
  getStripeClient,
  getPaymentMethodInfo,
} from '../services/stripe.service.js';
import { db } from '../config/database.js';
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
    const successUrl = `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
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

/**
 * POST /api/stripe/sync-subscription
 * Manually sync subscription from Stripe (useful when webhooks fail)
 */
export const syncSubscription = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const userId = req.user.userId;
    logger.info(`Manual subscription sync requested for user: ${userId}`);

    // Get existing subscription to find Stripe customer ID
    const existingSub = await db.getSubscription(userId);
    
    if (!existingSub?.stripe_customer_id) {
      throw new AppError('No Stripe customer found for this user', 404);
    }

    const stripe = getStripeClient();
    
    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: existingSub.stripe_customer_id,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logger.info(`No Stripe subscriptions found for customer: ${existingSub.stripe_customer_id}`);
      sendSuccess(res, {
        synced: false,
        message: 'No active Stripe subscription found',
        tier: 'FREE',
      });
      return;
    }

    const stripeSub = subscriptions.data[0];
    const isActive = stripeSub.status === 'active' || stripeSub.status === 'trialing';
    const tier = isActive ? 'PREMIUM' : 'FREE';

    // Update subscription in database
    await db.upsertSubscription({
      user_id: userId,
      tier,
      status: stripeSub.status,
      stripe_customer_id: existingSub.stripe_customer_id,
      stripe_subscription_id: stripeSub.id,
      current_period_start: new Date(stripeSub.current_period_start * 1000),
      current_period_end: new Date(stripeSub.current_period_end * 1000),
    });

    logger.info(`✅ Subscription synced for user: ${userId}, tier: ${tier}`);

    sendSuccess(res, {
      synced: true,
      tier,
      status: stripeSub.status,
      current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
    });
  }
);

/**
 * POST /api/stripe/verify-session
 * Verify checkout session and activate subscription
 */
export const verifySession = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { sessionId } = req.body;
    
    if (!sessionId) {
      throw new AppError('Session ID is required', 400);
    }

    const userId = req.user.userId;
    logger.info(`Verifying checkout session: ${sessionId} for user: ${userId}`);

    const stripe = getStripeClient();
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify the session belongs to this user
    if (session.metadata?.user_id && session.metadata.user_id !== userId) {
      throw new AppError('Session does not belong to this user', 403);
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      sendSuccess(res, {
        verified: false,
        message: 'Payment not completed',
        status: session.payment_status,
      });
      return;
    }

    // Extract customer ID (handle both string and expanded object)
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;
    
    // Extract subscription ID (handle both string and expanded object)
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    if (!customerId) {
      throw new AppError('Customer ID not found in session', 500);
    }

    logger.info(`Extracted customer ID: ${customerId}, subscription ID: ${subscriptionId}`);

    // Update subscription in database
    await db.upsertSubscription({
      user_id: userId,
      tier: 'PREMIUM',
      status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId || undefined,
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    logger.info(`✅ Session verified and subscription activated for user: ${userId}`);

    sendSuccess(res, {
      verified: true,
      tier: 'PREMIUM',
      status: 'active',
    });
  }
);

/**
 * GET /api/stripe/payment-method
 * Get user's payment method info
 */
export const getPaymentMethod = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const paymentMethod = await getPaymentMethodInfo(req.user.userId);

    sendSuccess(res, {
      paymentMethod,
    });
  }
);

/**
 * GET /api/stripe/beta-spots
 * Get remaining beta spots (public endpoint)
 * Counts active premium subscriptions (including trials)
 */
export const getBetaSpots = asyncHandler(async (_req: Request, res: Response) => {
  const TOTAL_BETA_SPOTS = 500;

  try {
    const stripe = getStripeClient();

    // Count active subscriptions (active + trialing = beta users)
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    const trialingSubscriptions = await stripe.subscriptions.list({
      status: 'trialing',
      limit: 100,
    });

    // Total beta users = active + trialing
    const totalBetaUsers = subscriptions.data.length + trialingSubscriptions.data.length;
    const remainingSpots = Math.max(0, TOTAL_BETA_SPOTS - totalBetaUsers);

    logger.info(`Beta spots: ${remainingSpots}/${TOTAL_BETA_SPOTS} (${totalBetaUsers} users)`);

    sendSuccess(res, {
      total: TOTAL_BETA_SPOTS,
      used: totalBetaUsers,
      remaining: remainingSpots,
      percentage: Math.round((totalBetaUsers / TOTAL_BETA_SPOTS) * 100),
    });
  } catch (error) {
    logger.error('Failed to fetch beta spots:', error);
    // Return default values on error
    sendSuccess(res, {
      total: TOTAL_BETA_SPOTS,
      used: 153,
      remaining: 347,
      percentage: 31,
    });
  }
});

/**
 * POST /api/stripe/reactivate-subscription
 * Reactivate a canceled subscription (remove cancel_at_period_end)
 */
export const reactivateSubscription = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const userId = req.user.userId;
    logger.info(`Reactivating subscription for user: ${userId}`);

    // Get existing subscription
    const existingSub = await db.getSubscription(userId);
    
    if (!existingSub?.stripe_subscription_id) {
      throw new AppError('No active subscription found', 404);
    }

    const stripe = getStripeClient();
    
    // Reactivate by removing cancel_at_period_end
    const subscription = await stripe.subscriptions.update(
      existingSub.stripe_subscription_id,
      { cancel_at_period_end: false }
    );

    // Update database
    await db.updateSubscription(userId, {
      status: subscription.status,
      cancel_at_period_end: false,
    });

    logger.info(`✅ Subscription reactivated for user: ${userId}`);

    sendSuccess(res, {
      success: true,
      message: 'Subscription reactivated successfully',
      status: subscription.status,
      cancel_at_period_end: false,
    });
  }
);
