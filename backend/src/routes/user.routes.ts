/**
 * User Routes
 * User profile and data endpoints
 */

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getSubscription,
  getNotionConnection,
  uploadAvatar,
  deleteAvatar,
  getAppData,
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * Get user profile
 * GET /api/user/profile
 */
router.get('/profile', getProfile);

/**
 * Update user profile (name, avatar)
 * PATCH /api/user/profile
 */
router.patch('/profile', updateProfile);

/**
 * Get user subscription
 * GET /api/user/subscription
 */
router.get('/subscription', getSubscription);

/**
 * Get Notion connection
 * GET /api/user/notion-connection
 */
router.get('/notion-connection', getNotionConnection);

/**
 * Upload avatar (base64)
 * POST /api/user/avatar
 */
router.post('/avatar', uploadAvatar);

/**
 * Delete avatar
 * DELETE /api/user/avatar
 */
router.delete('/avatar', deleteAvatar);

/**
 * Get all app data (for desktop app initialization)
 * GET /api/user/app-data
 * Returns: user, subscription, notionWorkspace, notionToken (decrypted)
 */
router.get('/app-data', getAppData);

export default router;
