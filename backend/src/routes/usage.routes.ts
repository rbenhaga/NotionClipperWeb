/**
 * Usage Routes
 * Track user usage (clips, files, focus mode minutes, compact mode minutes)
 */

import { Router } from 'express';
import { trackUsage, getCurrentUsage, checkQuota } from '../controllers/usage.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { generalRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

/**
 * POST /api/usage/track
 * Track usage increment for a specific feature
 * 🔒 SECURITY FIX: Now requires JWT authentication
 * userId is extracted from token, not from body (prevents forgery)
 */
router.post('/track', authenticateToken, generalRateLimiter, trackUsage);

/**
 * GET /api/usage/current
 * Get current month usage for authenticated user
 * Requires JWT authentication
 */
router.get('/current', authenticateToken, generalRateLimiter, getCurrentUsage);

/**
 * POST /api/usage/check-quota
 * Check if user has reached quota limit for a specific feature
 * 🔒 SECURITY FIX: Now requires JWT authentication
 * userId is extracted from token, not from body (prevents forgery)
 */
router.post('/check-quota', authenticateToken, generalRateLimiter, checkQuota);

export default router;
