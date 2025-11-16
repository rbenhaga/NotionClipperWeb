/**
 * User Routes
 * User profile and data endpoints
 */

import { Router } from 'express';
import {
  getProfile,
  getSubscription,
  getNotionConnection,
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
 * Get user subscription
 * GET /api/user/subscription
 */
router.get('/subscription', getSubscription);

/**
 * Get Notion connection
 * GET /api/user/notion-connection
 */
router.get('/notion-connection', getNotionConnection);

export default router;
