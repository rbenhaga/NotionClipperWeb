/**
 * Stripe Service
 * Handles payment processing and subscription management
 */

import Stripe from 'stripe';
import { config } from '../config/index.js';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../types/index.js';

// Initialize Stripe lazily to ensure secrets are loaded first
let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripe) {
    if (!config.stripe.secretKey) {
      throw new AppError('Stripe secret key not configured', 500);
    }
    stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16',
    });
    logger.info('Stripe client initialized with key: ' + config.stripe.secretKey.substring(0, 20) + '...');
  }
  return stripe;
}

/**
 * Create Stripe Checkout session for Premium upgrade
 * @param userId - User ID
 * @param plan - Plan type: 'premium_monthly', 'premium_annual', or 'premium_onetime'
 * @param successUrl - Success redirect URL
 * @param cancelUrl - Cancel redirect URL
 */
export async function createCheckoutSession(
  userId: string,
  plan: 'premium_monthly' | 'premium_annual' | 'premium_onetime',
  successUrl: string,
  cancelUrl: string
) {
  try {
    // Get user info
    const user = await db.getUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Select correct Price ID based on plan
    let priceId: string;
    let mode: 'subscription' | 'payment' = 'subscription';

    switch (plan) {
      case 'premium_monthly':
        priceId = config.stripe.prices.monthly;
        break;
      case 'premium_annual':
        priceId = config.stripe.prices.annual;
        break;
      case 'premium_onetime':
        priceId = config.stripe.prices.onetime;
        mode = 'payment'; // One-time payment, not subscription
        break;
      default:
        throw new AppError('Invalid plan type', 400);
    }

    if (!priceId) {
      throw new AppError(`Price ID not configured for plan: ${plan}`, 500);
    }

    // Get or create Stripe customer
    let customerId = (await db.getSubscription(userId))?.stripe_customer_id;

    if (!customerId) {
      const customer = await getStripeClient().customers.create({
        email: user.email,
        metadata: {
          user_id: userId,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await getStripeClient().checkout.sessions.create({
      customer: customerId,
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        plan,
      },
    });

    logger.info(`Checkout session created for user: ${userId}, plan: ${plan}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    logger.error('Failed to create checkout session:', error);
    throw new AppError('Failed to create checkout session', 500);
  }
}

/**
 * Create Stripe Customer Portal session
 */
export async function createPortalSession(userId: string, returnUrl: string) {
  try {
    const subscription = await db.getSubscription(userId);

    if (!subscription?.stripe_customer_id) {
      throw new AppError('No active subscription found', 404);
    }

    const session = await getStripeClient().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    logger.info(`Portal session created for user: ${userId}`);

    return {
      url: session.url,
    };
  } catch (error) {
    logger.error('Failed to create portal session:', error);
    throw new AppError('Failed to create portal session', 500);
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  logger.info(`Processing Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.debug(`Unhandled webhook event: ${event.type}`);
    }
  } catch (error) {
    logger.error(`Error processing webhook ${event.type}:`, error);
    throw error;
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    logger.warn('Checkout session missing user_id metadata');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  await db.updateSubscription(userId, {
    tier: 'premium',
    status: 'active',
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  });

  logger.info(`Subscription activated for user: ${userId}`);
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    logger.warn('Subscription missing user_id metadata');
    return;
  }

  await db.updateSubscription(userId, {
    status: subscription.status === 'active' ? 'active' : 'past_due',
    current_period_end: new Date(subscription.current_period_end * 1000),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  logger.info(`Subscription updated for user: ${userId}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    logger.warn('Subscription missing user_id metadata');
    return;
  }

  await db.updateSubscription(userId, {
    tier: 'free',
    status: 'canceled',
  });

  logger.info(`Subscription canceled for user: ${userId}`);
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  logger.warn(`Payment failed for customer: ${customerId}`);

  // TODO: Send email notification to user
  // TODO: Update subscription status to past_due
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  try {
    return getStripeClient().webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
  } catch (error) {
    logger.error('Failed to construct webhook event:', error);
    throw new AppError('Invalid webhook signature', 400);
  }
}
