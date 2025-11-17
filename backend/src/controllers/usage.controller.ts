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

/**
 * POST /api/usage/track
 * Track usage increment for a specific feature
 */
export const trackUsage = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, feature, increment = 1, metadata } = req.body;

    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    const validFeatures: UsageFeature[] = [
      'clips',
      'files',
      'focus_mode_minutes',
      'compact_mode_minutes',
    ];

    if (!feature || !validFeatures.includes(feature)) {
      throw new AppError(
        `Invalid feature. Must be one of: ${validFeatures.join(', ')}`,
        400
      );
    }

    logger.info(`[track-usage] Tracking ${feature} for user ${userId}, increment: ${increment}`);

    // Get or create subscription
    const subscription = await db.getSubscriptionByUserId(userId);

    if (!subscription) {
      logger.info('[track-usage] No subscription found, returning default');
      sendSuccess(res, {
        success: true,
        message: 'No subscription to track',
      });
      return;
    }

    // Increment usage counter via RPC
    const usageRecord = await db.incrementUsageCounter(userId, feature, increment);

    // Log usage event if metadata provided
    if (metadata && usageRecord) {
      try {
        const eventTypeMap: Record<UsageFeature, string> = {
          clips: 'clip_sent',
          files: 'file_uploaded',
          focus_mode_minutes: 'focus_mode_used',
          compact_mode_minutes: 'compact_mode_used',
        };

        const eventType = eventTypeMap[feature as UsageFeature] || 'unknown';

        await db.logUsageEvent({
          userId,
          subscriptionId: subscription.id,
          usageRecordId: usageRecord.id,
          eventType,
          feature,
          metadata: metadata || {},
        });

        logger.info('[track-usage] Usage event logged successfully');
      } catch (eventError) {
        logger.error('[track-usage] Failed to log usage event:', eventError);
        // Don't fail the request if event logging fails
      }
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
