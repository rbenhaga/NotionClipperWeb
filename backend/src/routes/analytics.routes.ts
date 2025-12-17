/**
 * Analytics Routes
 * Content analytics and productivity metrics endpoints
 */

import { Router } from 'express';
import {
  storeContent,
  analyzeContent,
  getProductivityAnalytics,
  getInsights,
  generateInsights,
  dismissInsight,
  markInsightRead,
  refreshMetrics,
} from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

/**
 * Store content for analysis
 * POST /api/analytics/content
 * Body: { contentType, rawContent, parsedContent?, parsedBlocks?, activityLogId?, fileType?, fileSizeBytes?, filePages? }
 */
router.post('/content', storeContent);

/**
 * Analyze content without storing
 * POST /api/analytics/analyze
 * Body: { content }
 */
router.post('/analyze', analyzeContent);

/**
 * Get productivity analytics
 * GET /api/analytics/productivity?days=30
 */
router.get('/productivity', getProductivityAnalytics);

/**
 * Get content insights
 * GET /api/analytics/insights?limit=10
 */
router.get('/insights', getInsights);

/**
 * Trigger insight generation
 * POST /api/analytics/insights/generate
 */
router.post('/insights/generate', generateInsights);

/**
 * Dismiss an insight
 * POST /api/analytics/insights/:id/dismiss
 */
router.post('/insights/:id/dismiss', dismissInsight);

/**
 * Mark insight as read
 * POST /api/analytics/insights/:id/read
 */
router.post('/insights/:id/read', markInsightRead);

/**
 * Refresh daily metrics
 * POST /api/analytics/metrics/refresh
 */
router.post('/metrics/refresh', refreshMetrics);

export default router;
