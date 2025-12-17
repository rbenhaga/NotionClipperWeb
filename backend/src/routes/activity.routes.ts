/**
 * Activity Routes
 * Activity logs endpoints
 */

import { Router } from 'express';
import {
  getActivityList,
  getActivityStats,
  exportActivity,
} from '../controllers/activity.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All activity routes require authentication
router.use(authenticateToken);

/**
 * Get activity list with pagination
 * GET /api/activity/list?limit=50&offset=0&startDate=...&endDate=...
 */
router.get('/list', getActivityList);

/**
 * Get activity statistics
 * GET /api/activity/stats?days=30
 */
router.get('/stats', getActivityStats);

/**
 * Export activity as CSV-ready data
 * GET /api/activity/export?startDate=...&endDate=...
 */
router.get('/export', exportActivity);

export default router;
