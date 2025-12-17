/**
 * Analytics Controller
 * Handles content analytics and productivity metrics endpoints
 */

import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '../types/index.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import * as analyticsService from '../services/content-analytics.service.js';

/**
 * POST /api/analytics/content
 * Store content for analysis
 */
export const storeContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const {
      activityLogId,
      contentType,
      rawContent,
      parsedContent,
      parsedBlocks,
      fileType,
      fileSizeBytes,
      filePages,
    } = req.body;

    if (!contentType || !rawContent) {
      throw new AppError('contentType and rawContent are required', 400);
    }

    const contentId = await analyticsService.storeContent({
      userId: req.user.userId,
      activityLogId,
      contentType,
      rawContent,
      parsedContent,
      parsedBlocks,
      fileType,
      fileSizeBytes,
      filePages,
    });

    logger.info(`Content stored for user: ${req.user.userId}, id: ${contentId}`);

    return sendSuccess(res, { contentId }, 201);
  }
);

/**
 * POST /api/analytics/analyze
 * Analyze content without storing
 */
export const analyzeContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { content } = req.body;

    if (!content) {
      throw new AppError('content is required', 400);
    }

    const analysis = analyticsService.analyzeContent(content);

    return sendSuccess(res, { analysis });
  }
);

/**
 * GET /api/analytics/productivity
 * Get productivity analytics for the current user
 */
export const getProductivityAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const analytics = await analyticsService.getProductivityAnalytics(req.user.userId, days);

    logger.debug(`Productivity analytics fetched for user: ${req.user.userId}`);

    return sendSuccess(res, analytics);
  }
);

/**
 * GET /api/analytics/insights
 * Get content insights for the current user
 */
export const getInsights = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const insights = await analyticsService.getContentInsights(req.user.userId, limit);

    return sendSuccess(res, { insights });
  }
);

/**
 * POST /api/analytics/insights/generate
 * Trigger insight generation for the current user
 */
export const generateInsights = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    await analyticsService.generateInsights(req.user.userId);

    logger.info(`Insights generated for user: ${req.user.userId}`);

    return sendSuccess(res, { message: 'Insights generation triggered' });
  }
);

/**
 * POST /api/analytics/insights/:id/dismiss
 * Dismiss an insight
 */
export const dismissInsight = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Insight ID is required', 400);
    }

    await analyticsService.dismissInsight(req.user.userId, id);

    return sendSuccess(res, { message: 'Insight dismissed' });
  }
);

/**
 * POST /api/analytics/insights/:id/read
 * Mark an insight as read
 */
export const markInsightRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Insight ID is required', 400);
    }

    await analyticsService.markInsightRead(req.user.userId, id);

    return sendSuccess(res, { message: 'Insight marked as read' });
  }
);

/**
 * POST /api/analytics/metrics/refresh
 * Refresh daily metrics for the current user
 */
export const refreshMetrics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    await analyticsService.updateDailyMetrics(req.user.userId);

    logger.info(`Metrics refreshed for user: ${req.user.userId}`);

    return sendSuccess(res, { message: 'Metrics refreshed' });
  }
);
