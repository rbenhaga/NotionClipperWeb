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

export function getStripeClient(): Stripe {
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

    // Check if user already had a subscription (no trial for returning users)
    const existingSubscription = await db.getSubscription(userId);
    const hadPreviousSubscription = existingSubscription?.stripe_subscription_id;

    // Add 14-day trial for subscriptions (not one-time payments) and new users only
    const trialDays = (mode === 'subscription' && !hadPreviousSubscription) ? 14 : undefined;
    
    if (trialDays) {
      logger.info(`Adding ${trialDays}-day trial for new user: ${userId}`);
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
      ...(trialDays && mode === 'subscription' ? {
        subscription_data: {
          trial_period_days: trialDays,
          metadata: {
            user_id: userId,
          },
        },
      } : {}),
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
 * Extract customer ID from potentially corrupted data
 * (handles case where full customer object was stored instead of just ID)
 */
function extractCustomerId(customerData: string): string {
  if (!customerData) return '';
  
  // If it starts with 'cus_', it's already a valid ID
  if (customerData.startsWith('cus_')) {
    return customerData;
  }
  
  // Try to parse as JSON and extract the ID
  try {
    const parsed = JSON.parse(customerData);
    if (parsed && parsed.id && typeof parsed.id === 'string') {
      return parsed.id;
    }
  } catch {
    // Not JSON, return as-is
  }
  
  return customerData;
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

    // Extract clean customer ID (in case corrupted data was stored)
    const customerId = extractCustomerId(subscription.stripe_customer_id);
    
    if (!customerId || !customerId.startsWith('cus_')) {
      logger.error(`Invalid customer ID format: ${subscription.stripe_customer_id?.substring(0, 50)}...`);
      throw new AppError('Invalid customer ID in database', 500);
    }

    logger.info(`Creating portal session for customer: ${customerId}`);

    const session = await getStripeClient().billingPortal.sessions.create({
      customer: customerId,
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

  logger.info(`Processing checkout completion for user: ${userId}`);
  logger.info(`Customer ID: ${customerId}, Subscription ID: ${subscriptionId}`);

  // Use upsertSubscription to handle both create and update cases
  await db.upsertSubscription({
    user_id: userId,
    tier: 'PREMIUM', // UPPERCASE to match DB enum
    status: 'active',
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  logger.info(`✅ Subscription activated for user: ${userId}`);
}

/**
 * Handle subscription update
 * Also handles workspace downgrade when tier changes from PREMIUM to FREE
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Try to get user_id from subscription metadata first
  let userId = subscription.metadata?.user_id;
  
  // If not in metadata, try to find by customer ID
  if (!userId) {
    const customerId = subscription.customer as string;
    logger.info(`Looking up user by customer ID: ${customerId}`);
    
    // Query database to find user by stripe_customer_id
    const supabase = (await import('../config/database.js')).getSupabaseClient();
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id, tier')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    
    if (data) {
      userId = data.user_id;
    }
  }
  
  if (!userId) {
    logger.warn('Subscription missing user_id and could not find by customer ID');
    return;
  }

  // Get previous tier to detect downgrade
  const previousSubscription = await db.getSubscription(userId);
  const previousTier = previousSubscription?.tier;

  const tier = subscription.status === 'active' || subscription.status === 'trialing' ? 'PREMIUM' : 'FREE';
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;
  
  await db.upsertSubscription({
    user_id: userId,
    tier: tier as 'FREE' | 'PREMIUM' | 'GRACE_PERIOD',
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  // Handle workspace downgrade if tier changed from PREMIUM to FREE
  if (previousTier === 'PREMIUM' && tier === 'FREE') {
    logger.info(`Tier downgrade detected for user ${userId}: PREMIUM -> FREE`);
    await handleWorkspaceDowngrade(userId);
  }

  logger.info(`✅ Subscription updated for user: ${userId}, tier: ${tier}, cancel_at_period_end: ${cancelAtPeriodEnd}`);
}

/**
 * Handle subscription cancellation
 * Also handles workspace downgrade: keeps only the default workspace active
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Try to get user_id from subscription metadata first
  let userId = subscription.metadata?.user_id;
  
  // If not in metadata, try to find by customer ID
  if (!userId) {
    const customerId = subscription.customer as string;
    const supabase = (await import('../config/database.js')).getSupabaseClient();
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    
    if (data) {
      userId = data.user_id;
    }
  }
  
  if (!userId) {
    logger.warn('Subscription missing user_id and could not find by customer ID');
    return;
  }

  // Update subscription to FREE tier
  await db.upsertSubscription({
    user_id: userId,
    tier: 'FREE',
    status: 'canceled',
  });

  // Handle workspace downgrade: deactivate all non-default workspaces
  await handleWorkspaceDowngrade(userId);

  logger.info(`✅ Subscription canceled for user: ${userId}`);
}

/**
 * Handle workspace downgrade when user goes from Premium to Free
 * Keeps only the default workspace active, deactivates all others
 */
async function handleWorkspaceDowngrade(userId: string) {
  try {
    const supabase = (await import('../config/database.js')).getSupabaseClient();
    
    // Get all active workspaces for this user
    const { data: workspaces, error: fetchError } = await supabase
      .from('notion_connections')
      .select('id, is_default, workspace_name')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (fetchError) {
      logger.error('Error fetching workspaces for downgrade:', fetchError);
      return;
    }

    if (!workspaces || workspaces.length <= 1) {
      logger.info(`User ${userId} has ${workspaces?.length || 0} workspace(s), no downgrade needed`);
      return;
    }

    // Find the default workspace
    const defaultWorkspace = workspaces.find(w => w.is_default);
    
    // If no default is set, make the first one default
    if (!defaultWorkspace && workspaces.length > 0) {
      const firstWorkspace = workspaces[0];
      await supabase
        .from('notion_connections')
        .update({ is_default: true })
        .eq('id', firstWorkspace.id);
      
      logger.info(`Set workspace ${firstWorkspace.workspace_name} as default for user ${userId}`);
    }

    // Deactivate all non-default workspaces
    const workspacesToDeactivate = workspaces.filter(w => !w.is_default);
    
    if (workspacesToDeactivate.length > 0) {
      const idsToDeactivate = workspacesToDeactivate.map(w => w.id);
      
      const { error: updateError } = await supabase
        .from('notion_connections')
        .update({ 
          is_active: false,
          connection_status: 'disconnected',
          updated_at: new Date().toISOString()
        })
        .in('id', idsToDeactivate);

      if (updateError) {
        logger.error('Error deactivating workspaces:', updateError);
        return;
      }

      logger.info(`✅ Deactivated ${workspacesToDeactivate.length} non-default workspace(s) for user ${userId}`);
      workspacesToDeactivate.forEach(w => {
        logger.info(`  - Deactivated: ${w.workspace_name}`);
      });
    }
  } catch (error) {
    logger.error('Error handling workspace downgrade:', error);
  }
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
 * Get payment method info for a customer
 */
export async function getPaymentMethodInfo(userId: string) {
  try {
    const subscription = await db.getSubscription(userId);

    if (!subscription?.stripe_customer_id) {
      return null;
    }

    const customerId = extractCustomerId(subscription.stripe_customer_id);
    
    if (!customerId || !customerId.startsWith('cus_')) {
      return null;
    }

    // Get customer's default payment method
    const customer = await getStripeClient().customers.retrieve(customerId, {
      expand: ['default_source', 'invoice_settings.default_payment_method'],
    }) as Stripe.Customer;

    if (customer.deleted) {
      return null;
    }

    // Try to get payment method from invoice settings first
    const defaultPaymentMethod = customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod | null;
    
    if (defaultPaymentMethod && defaultPaymentMethod.card) {
      return {
        brand: defaultPaymentMethod.card.brand,
        last4: defaultPaymentMethod.card.last4,
        expMonth: defaultPaymentMethod.card.exp_month,
        expYear: defaultPaymentMethod.card.exp_year,
      };
    }

    // Fallback: list payment methods
    const paymentMethods = await getStripeClient().paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    });

    if (paymentMethods.data.length > 0 && paymentMethods.data[0].card) {
      const card = paymentMethods.data[0].card;
      return {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      };
    }

    return null;
  } catch (error) {
    logger.error('Failed to get payment method info:', error);
    return null;
  }
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  try {
    logger.debug('Constructing webhook event', {
      payloadType: typeof payload,
      payloadIsBuffer: Buffer.isBuffer(payload),
      signatureLength: signature.length,
      webhookSecretPrefix: config.stripe.webhookSecret.substring(0, 10) + '...',
    });

    const event = getStripeClient().webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
    logger.info(`✅ Webhook signature verified successfully for event: ${event.type}`);
    return event;
  } catch (error) {
    logger.error('❌ Failed to construct webhook event:', {
      error: error instanceof Error ? error.message : error,
      payloadType: typeof payload,
      payloadIsBuffer: Buffer.isBuffer(payload),
      payloadLength: Buffer.isBuffer(payload) ? payload.length : (typeof payload === 'string' ? payload.length : 0),
    });
    throw new AppError('Invalid webhook signature', 400);
  }
}
