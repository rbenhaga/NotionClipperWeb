/**
 * Usage Routes
 * Track user usage (clips, files, focus mode minutes, compact mode minutes)
 */

import { Router } from 'express';
import { trackUsage, getCurrentUsage } from '../controllers/usage.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { generalRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

/**
 * POST /api/usage/track
 * Track usage increment for a specific feature
 * Body: { userId: string, feature: 'clips' | 'files' | 'focus_mode_minutes' | 'compact_mode_minutes', increment?: number, metadata?: any }
 */
router.post('/track', generalRateLimiter, trackUsage);

/**
 * GET /api/usage/current
 * Get current month usage for authenticated user
 * Requires JWT authentication
 */
router.get('/current', authenticateToken, generalRateLimiter, getCurrentUsage);

export default router;
