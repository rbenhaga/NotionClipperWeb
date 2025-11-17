/**
 * User Controllers
 * Handles user profile and subscription endpoints
 */

import { Response } from 'express';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendNotFound } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AuthenticatedRequest, AppError } from '../types/index.js';

/**
 * GET /api/user/profile
 * Get current user profile
 */
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await db.getUserById(req.user.userId);

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    logger.debug(`Profile fetched for user: ${req.user.userId}`);

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider,
      created_at: user.created_at,
    });
  }
);

/**
 * GET /api/user/subscription
 * Get current user subscription
 */
export const getSubscription = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const subscription = await db.getSubscription(req.user.userId);

    if (!subscription) {
      // Return default FREE tier if no subscription found
      logger.warn(`No subscription found for user: ${req.user.userId}, returning FREE tier`);

      return sendSuccess(res, {
        tier: 'free',
        status: 'active',
        quotas: {
          clips_per_month: 100,
          files_per_month: 10,
          focus_mode_minutes: 60,
          compact_mode_minutes: 30,
        },
      });
    }

    logger.debug(`Subscription fetched for user: ${req.user.userId}`);

    return sendSuccess(res, {
      id: subscription.id,
      tier: subscription.tier,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
  }
);

/**
 * GET /api/user/notion-connection
 * Get Notion workspace connection
 */
export const getNotionConnection = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const connection = await db.getNotionConnection(req.user.userId);

    if (!connection) {
      return sendNotFound(res, 'No Notion connection found');
    }

    logger.debug(`Notion connection fetched for user: ${req.user.userId}`);

    // Don't send encrypted token to client
    return sendSuccess(res, {
      workspace_id: connection.workspace_id,
      workspace_name: connection.workspace_name,
      is_active: connection.is_active,
      connected_at: connection.created_at,
    });
  }
);
