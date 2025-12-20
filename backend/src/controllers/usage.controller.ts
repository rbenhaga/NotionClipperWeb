/**
 * Usage Controller
 * Track user usage (clips, files, minutes)
 */

import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError } from '../types/index.js';

type UsageFeature = 'clips' | 'files' | 'focus_mode_minutes' | 'compact_mode_minutes';

// 🔒 SECURITY: Strict allowlist for features (prevents injection of arbitrary features)
const ALLOWED_FEATURES = new Set<UsageFeature>(['clips', 'files', 'focus_mode_minutes', 'compact_mode_minutes']);

// 🔒 SECURITY: Allowlist for metadata keys (prevents PII leakage and log injection)
const ALLOWED_METADATA_KEYS = new Set(['word_count', 'page_count', 'is_multiple_selection', 'file_type', 'file_size', 'duration_seconds']);

/**
 * POST /api/usage/track
 * Track usage increment for a specific feature
 * 🔒 SECURITY: userId is extracted from JWT token ONLY, never from body
 */
export const trackUsage = asyncHandler(
  async (req: Request, res: Response) => {
    const { feature, increment = 1, metadata } = req.body;
    
    // 🔒 SECURITY P0: Extract userId from JWT token ONLY (set by auth middleware)
    // NEVER use body.userId - that would allow any user to track usage for any other user
    const userId = (req as any).user?.userId;

    // 🔒 HARD ASSERTION: userId MUST be present (middleware should have rejected otherwise)
    if (!userId || typeof userId !== 'string') {
      logger.error('[track-usage] SECURITY: userId missing or invalid from JWT - this should never happen');
      throw new AppError('Authentication required - valid JWT token must be provided', 401);
    }

    // 🔒 SECURITY: Validate userId is a valid UUID format (prevents DB errors / DoS)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      logger.warn(`[track-usage] Invalid UUID format for userId: ${userId.substring(0, 20)}...`);
      throw new AppError('Invalid user ID format', 400);
    }

    // 🔒 SECURITY: Validate increment is a reasonable positive number
    const incrementNum = Number(increment);
    if (!Number.isInteger(incrementNum) || incrementNum < 1 || incrementNum > 100) {
      throw new AppError('Invalid increment. Must be an integer between 1 and 100', 400);
    }

    // 🔒 SECURITY: Strict feature validation using Set (O(1) lookup, no injection)
    if (!feature || typeof feature !== 'string' || !ALLOWED_FEATURES.has(feature as UsageFeature)) {
      throw new AppError(
        `Invalid feature. Must be one of: ${Array.from(ALLOWED_FEATURES).join(', ')}`,
        400
      );
    }

    // 🔒 SECURITY: Validate metadata - size limit + key allowlist
    let sanitizedMetadata: Record<string, any> | undefined;
    if (metadata && typeof metadata === 'object') {
      const metadataStr = JSON.stringify(metadata);
      if (metadataStr.length > 10000) {
        throw new AppError('Metadata too large. Maximum 10KB allowed', 400);
      }
      
      // Filter to only allowed keys (prevents PII leakage)
      sanitizedMetadata = {};
      for (const key of Object.keys(metadata)) {
        if (ALLOWED_METADATA_KEYS.has(key)) {
          const value = metadata[key];
          // Only allow primitive values (no nested objects)
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            sanitizedMetadata[key] = value;
          }
        }
      }
    }

    logger.info(`[track-usage] Tracking ${feature} for user ${userId}, increment: ${incrementNum}`);

    // 🔧 FIX: Ensure user exists in user_profiles before tracking
    // This prevents FK constraint violations on usage_events
    try {
      const existingUser = await db.getUserById(userId);
      if (!existingUser) {
        logger.info(`[track-usage] User ${userId} not found in user_profiles, creating placeholder`);
        await db.upsertUser({
          id: userId,
          email: `user-${userId.substring(0, 8)}@placeholder.local`,
          auth_provider: 'notion', // Default to notion since most users come from there
        });
      }
    } catch (userError) {
      logger.warn(`[track-usage] Could not ensure user exists: ${userError}`);
      // Continue anyway - the subscription check will handle missing users
    }

    // Get or create subscription
    const subscription = await db.getSubscription(userId);

    if (!subscription) {
      logger.info('[track-usage] No subscription found, returning default');
      sendSuccess(res, {
        success: true,
        message: 'No subscription to track',
      });
      return;
    }

    // Increment usage counter via RPC (use validated increment)
    // Cast is safe because we validated feature against ALLOWED_FEATURES
    const validatedFeature = feature as UsageFeature;
    const usageRecord = await db.incrementUsageCounter(userId, validatedFeature, incrementNum);

    // Log usage event if sanitized metadata provided
    if (sanitizedMetadata && Object.keys(sanitizedMetadata).length > 0 && usageRecord) {
      try {
        const eventTypeMap: Record<UsageFeature, 'clip_sent' | 'file_uploaded' | 'focus_mode_started' | 'focus_mode_ended' | 'compact_mode_started' | 'compact_mode_ended' | 'quota_exceeded' | 'subscription_upgraded' | 'subscription_downgraded'> = {
          clips: 'clip_sent',
          files: 'file_uploaded',
          focus_mode_minutes: 'focus_mode_started',
          compact_mode_minutes: 'compact_mode_started',
        };

        const eventType = eventTypeMap[validatedFeature];

        await db.logUsageEvent({
          userId,
          subscriptionId: subscription.id,
          usageRecordId: usageRecord.id,
          eventType,
          feature: validatedFeature,
          metadata: sanitizedMetadata, // 🔒 Use sanitized metadata only
        });

        logger.info('[track-usage] Usage event logged successfully');
      } catch (eventError) {
        // 🔧 FIX: Log error but don't fail the main tracking operation
        // The usage counter was already incremented, event logging is secondary
        logger.error('[track-usage] Failed to log usage event (non-blocking):', eventError);
      }
    }

    // 🔧 FIX: Return error if usage record wasn't created
    if (!usageRecord) {
      throw new AppError('Failed to track usage - no usage record created', 500);
    }

    sendSuccess(res, {
      success: true,
      usageRecord,
    });
  }
);

/**
 * GET /api/usage/current
 * Get current month usage for authenticated user
 */
export const getCurrentUsage = asyncHandler(
  async (req: Request, res: Response) => {
    // User ID comes from JWT token (set by auth middleware)
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const usage = await db.getCurrentUsage(userId, year, month);

    sendSuccess(res, {
      usage: usage || {
        clips_count: 0,
        files_count: 0,
        focus_mode_minutes: 0,
        compact_mode_minutes: 0,
        year,
        month,
      },
    });
  }
);

// 🔒 FREE tier default quotas (fallback when no subscription exists)
const FREE_TIER_QUOTAS: Record<UsageFeature, number> = {
  clips: 50,
  files: 10,
  focus_mode_minutes: 60,
  compact_mode_minutes: 60,
};

/**
 * POST /api/usage/check-quota
 * Check if user has reached quota limit for a specific feature
 * 🔒 SECURITY: userId is extracted from JWT token ONLY, never from body
 */
export const checkQuota = asyncHandler(
  async (req: Request, res: Response) => {
    const { feature } = req.body;
    
    // 🔒 SECURITY P0: Extract userId from JWT token ONLY (set by auth middleware)
    // NEVER use body.userId - that would allow quota checks for any user
    const userId = (req as any).user?.userId;

    // 🔒 HARD ASSERTION: userId MUST be present
    if (!userId || typeof userId !== 'string') {
      logger.error('[check-quota] SECURITY: userId missing or invalid from JWT');
      throw new AppError('Authentication required - valid JWT token must be provided', 401);
    }

    // 🔒 SECURITY: Validate userId is a valid UUID format (prevents DB errors / DoS)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      logger.warn(`[check-quota] Invalid UUID format for userId: ${userId.substring(0, 20)}...`);
      throw new AppError('Invalid user ID format', 400);
    }

    // 🔒 SECURITY: Strict feature validation using Set
    if (!feature || typeof feature !== 'string' || !ALLOWED_FEATURES.has(feature as UsageFeature)) {
      throw new AppError(
        `Invalid feature. Must be one of: ${Array.from(ALLOWED_FEATURES).join(', ')}`,
        400
      );
    }

    // Cast is safe because we validated feature against ALLOWED_FEATURES
    const validatedFeature = feature as UsageFeature;
    
    logger.info(`[check-quota] Checking quota for user ${userId}, feature: ${validatedFeature}`);

    // Check quota via RPC - with fallback for users without subscription
    let quotaCheck;
    try {
      quotaCheck = await db.checkQuotaLimit(userId, validatedFeature);
    } catch (error: any) {
      // 🔧 FIX: Handle "No subscription found" gracefully instead of 500
      // This happens for new users or users who haven't been assigned a subscription yet
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('No subscription found') || error?.code === 'P0001') {
        logger.info(`[check-quota] No subscription for user ${userId}, returning FREE tier defaults`);
        
        const freeLimit = FREE_TIER_QUOTAS[validatedFeature];
        quotaCheck = {
          allowed: true,
          current_usage: 0,
          limit: freeLimit,
          remaining: freeLimit,
          tier: 'FREE',
          reason: 'Free tier - no subscription found',
        };
      } else {
        // Re-throw unexpected errors
        throw error;
      }
    }

    if (!quotaCheck) {
      // Fallback if RPC returns null (shouldn't happen but defensive)
      logger.warn(`[check-quota] RPC returned null for user ${userId}, using FREE defaults`);
      const freeLimit = FREE_TIER_QUOTAS[validatedFeature];
      quotaCheck = {
        allowed: true,
        current_usage: 0,
        limit: freeLimit,
        remaining: freeLimit,
        tier: 'FREE',
        reason: 'Default free tier quota',
      };
    }

    logger.info(`[check-quota] Result: ${quotaCheck.allowed ? 'ALLOWED' : 'DENIED'} - ${quotaCheck.reason}`);

    sendSuccess(res, quotaCheck);
  }
);
