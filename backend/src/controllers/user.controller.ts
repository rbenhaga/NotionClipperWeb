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
        id: null,
        user_id: req.user.userId,
        tier: 'FREE', // UPPERCASE to match frontend expectations
        status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
      });
    }

    // Normalize tier to uppercase for frontend
    const normalizedTier = subscription.tier ? subscription.tier.toUpperCase() : 'FREE';
    
    logger.info(`Subscription fetched for user: ${req.user.userId}, tier: ${normalizedTier}, status: ${subscription.status}`);

    return sendSuccess(res, {
      id: subscription.id,
      user_id: subscription.user_id,
      tier: normalizedTier,
      status: subscription.status,
      stripe_customer_id: subscription.stripe_customer_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
  }
);

/**
 * PATCH /api/user/profile
 * Update user profile (name, avatar)
 */
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { full_name, avatar_url } = req.body;

    // Validate input - sanitize to prevent XSS
    const sanitizedName = full_name ? String(full_name).slice(0, 100).trim() : undefined;
    const sanitizedAvatar = avatar_url ? String(avatar_url).slice(0, 500).trim() : undefined;

    // Validate avatar URL if provided
    if (sanitizedAvatar && !isValidUrl(sanitizedAvatar)) {
      throw new AppError('Invalid avatar URL', 400);
    }

    const user = await db.getUserById(req.user.userId);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Update user profile
    const updatedUser = await db.upsertUser({
      id: req.user.userId,
      email: user.email,
      full_name: sanitizedName !== undefined ? sanitizedName : user.full_name,
      avatar_url: sanitizedAvatar !== undefined ? sanitizedAvatar : user.avatar_url,
      auth_provider: user.auth_provider,
    });

    logger.info(`Profile updated for user: ${req.user.userId}`);

    return sendSuccess(res, {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      avatar_url: updatedUser.avatar_url,
      auth_provider: updatedUser.auth_provider,
    });
  }
);

// Helper to validate URL
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Helper to validate base64 data URL
function isValidDataUrl(dataUrl: string): boolean {
  const regex = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
  return regex.test(dataUrl);
}

/**
 * POST /api/user/avatar
 * Upload avatar as base64 (stored in database)
 */
export const uploadAvatar = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { avatar_data } = req.body;

    if (!avatar_data) {
      throw new AppError('Avatar data is required', 400);
    }

    // Validate it's a proper data URL
    if (!isValidDataUrl(avatar_data)) {
      throw new AppError('Invalid image format. Must be JPEG, PNG, WebP, or GIF', 400);
    }

    // Check size (100KB max for base64, accounting for ~37% overhead)
    const base64Data = avatar_data.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSize = 100 * 1024; // 100KB

    if (sizeInBytes > maxSize) {
      throw new AppError(`Avatar too large. Maximum size is 100KB, got ${Math.round(sizeInBytes / 1024)}KB`, 400);
    }

    const user = await db.getUserById(req.user.userId);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Update user with avatar data
    const updatedUser = await db.upsertUser({
      id: req.user.userId,
      email: user.email,
      full_name: user.full_name,
      avatar_url: avatar_data, // Store base64 in avatar_url field
      auth_provider: user.auth_provider,
    });

    logger.info(`Avatar uploaded for user: ${req.user.userId}, size: ${Math.round(sizeInBytes / 1024)}KB`);

    return sendSuccess(res, {
      avatar_url: updatedUser.avatar_url,
      message: 'Avatar uploaded successfully',
    });
  }
);

/**
 * DELETE /api/user/avatar
 * Remove user avatar
 */
export const deleteAvatar = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await db.getUserById(req.user.userId);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Update user to remove avatar
    await db.upsertUser({
      id: req.user.userId,
      email: user.email,
      full_name: user.full_name,
      avatar_url: undefined, // Remove avatar
      auth_provider: user.auth_provider,
    });

    logger.info(`Avatar removed for user: ${req.user.userId}`);

    return sendSuccess(res, {
      message: 'Avatar removed successfully',
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

/**
 * GET /api/user/app-data
 * Get all data needed for desktop app initialization
 * Returns: user profile, subscription, notion connection status, decrypted token
 * 
 * This endpoint is specifically for the desktop app to get everything in one call
 * after receiving the JWT token via deep link.
 */
export const getAppData = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const userId = req.user.userId;
    logger.info(`[AppData] Fetching app data for user: ${userId}`);

    // Fetch all data in parallel
    const [user, subscription, notionConnection] = await Promise.all([
      db.getUserById(userId),
      db.getSubscription(userId),
      db.getNotionConnection(userId),
    ]);

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Prepare response
    const response: any = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider,
        email_verified: user.email_verified ?? true, // OAuth users are auto-verified
      },
      subscription: subscription ? {
        tier: subscription.tier?.toUpperCase() || 'FREE',
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
      } : {
        tier: 'FREE',
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false,
      },
      hasNotionWorkspace: !!notionConnection && notionConnection.is_active,
      notionWorkspace: null,
      notionToken: null, // Will be populated if workspace exists
    };

    // If user has a Notion connection, include workspace info and decrypted token
    if (notionConnection && notionConnection.is_active) {
      response.notionWorkspace = {
        id: notionConnection.workspace_id,
        name: notionConnection.workspace_name,
        icon: notionConnection.workspace_icon,
      };

      // Decrypt the Notion token for the desktop app
      try {
        const { decryptToken } = await import('../services/crypto.service.js');
        // Field is named access_token_encrypted in the database
        const encryptedToken = notionConnection.access_token_encrypted;
        if (encryptedToken) {
          const decryptedToken = await decryptToken(encryptedToken);
          response.notionToken = decryptedToken;
          logger.info(`[AppData] Notion token decrypted for user: ${userId}`);
        } else {
          logger.warn(`[AppData] No encrypted token found for user: ${userId}`);
          response.notionToken = null;
        }
      } catch (error) {
        logger.error(`[AppData] Failed to decrypt Notion token for user: ${userId}`, error);
        // Don't fail the request, just don't include the token
        response.notionToken = null;
      }
    }

    logger.info(`[AppData] App data fetched for user: ${userId}, hasWorkspace: ${response.hasNotionWorkspace}`);

    return sendSuccess(res, response);
  }
);
