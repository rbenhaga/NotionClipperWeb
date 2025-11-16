/**
 * Auth Routes
 * OAuth and authentication endpoints
 */

import { Router } from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  initiateNotionAuth,
  handleNotionCallback,
  signup,
  login,
  logout,
} from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

/**
 * Email/Password Authentication
 */
router.post('/signup', signup);
router.post('/login', login);

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

/**
 * Logout
 */
router.post('/logout', logout);

export default router;
