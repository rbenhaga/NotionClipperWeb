/**
 * Auth Routes
 * OAuth only (Google + Notion) - Email auth removed for simplicity
 */

import { Router } from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  initiateNotionAuth,
  handleNotionCallback,
  completeNotionRegistration,
  finalizeNotionRegistration,
  logout,
  checkWorkspace,
} from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

/**
 * Google OAuth
 */
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);

/**
 * Notion OAuth
 */
router.get('/notion', initiateNotionAuth);
router.get('/notion/callback', handleNotionCallback);
router.post('/notion/complete', completeNotionRegistration);
router.post('/notion/finalize', finalizeNotionRegistration);

/**
 * Logout
 */
router.post('/logout', logout);

/**
 * Notion Workspace Check
 */
router.get('/check-workspace/:workspaceId', checkWorkspace);

export default router;
