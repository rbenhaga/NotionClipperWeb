/**
 * Activity Controller
 * Handles activity logs endpoints for dashboard
 */

import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '../types/index.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import * as activityService from '../services/activity.service.js';
import { ActivityValidationError } from '../services/activity.service.js';

/**
 * GET /api/activity/list
 * Get paginated activity logs for the current user
 * 🔒 SECURITY: Returns 400 on invalid dates (not 500)
 */
export const getActivityList = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    try {
      const activities = await activityService.getUserActivity(
        req.user.userId,
        limit,
        offset,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      logger.debug(`Activity list fetched for user: ${req.user.userId}, count: ${activities.length}`);

      return sendSuccess(res, { activities });
    } catch (error) {
      // 🔒 SECURITY: Validation errors → 400, not 500
      if (error instanceof ActivityValidationError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }
);

/**
 * GET /api/activity/stats
 * Get activity statistics for the current user
 */
export const getActivityStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const stats = await activityService.getActivityStats(req.user.userId, days);

    logger.debug(`Activity stats fetched for user: ${req.user.userId}`);

    return sendSuccess(res, stats);
  }
);

/**
 * GET /api/activity/export
 * Export activity logs as CSV-ready data
 */
export const exportActivity = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const data = await activityService.exportUserActivity(
      req.user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    logger.info(`Activity exported for user: ${req.user.userId}, rows: ${data.length}`);

    return sendSuccess(res, { data });
  }
);
