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

// 🔒 SECURITY: Maximum content size (1MB) to prevent DoS
const MAX_CONTENT_SIZE = 1 * 1024 * 1024; // 1MB

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

    // 🔒 SECURITY: Validate content size to prevent DoS
    if (typeof rawContent === 'string' && rawContent.length > MAX_CONTENT_SIZE) {
      throw new AppError(`Content too large. Maximum ${MAX_CONTENT_SIZE / 1024 / 1024}MB allowed`, 400);
    }
    if (parsedContent && typeof parsedContent === 'string' && parsedContent.length > MAX_CONTENT_SIZE) {
      throw new AppError(`Parsed content too large. Maximum ${MAX_CONTENT_SIZE / 1024 / 1024}MB allowed`, 400);
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

    // 🔒 SECURITY: Validate content size to prevent DoS
    if (typeof content === 'string' && content.length > MAX_CONTENT_SIZE) {
      throw new AppError(`Content too large. Maximum ${MAX_CONTENT_SIZE / 1024 / 1024}MB allowed`, 400);
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

// 🔒 SECURITY: UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * POST /api/analytics/insights/:id/dismiss
 * Dismiss an insight
 * 🔒 SECURITY: Service layer verifies ownership (user_id match)
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

    // 🔒 SECURITY: Validate UUID format to prevent DB errors
    if (!UUID_REGEX.test(id)) {
      throw new AppError('Invalid insight ID format', 400);
    }

    await analyticsService.dismissInsight(req.user.userId, id);

    return sendSuccess(res, { message: 'Insight dismissed' });
  }
);

/**
 * POST /api/analytics/insights/:id/read
 * Mark an insight as read
 * 🔒 SECURITY: Service layer verifies ownership (user_id match)
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

    // 🔒 SECURITY: Validate UUID format to prevent DB errors
    if (!UUID_REGEX.test(id)) {
      throw new AppError('Invalid insight ID format', 400);
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
