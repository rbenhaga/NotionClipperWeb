/**
 * Waitlist Routes
 * Public endpoints for waitlist registration and referral tracking
 * 🔒 SECURITY: Rate limited to prevent spam
 */

import { Router } from 'express';
import * as waitlistController from '../controllers/waitlist.controller.js';
import { authRateLimiter, generalRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

// Public routes (no auth required, but rate limited)

// POST /api/waitlist/register - Register for waitlist
// 🔒 SECURITY: Strict rate limit to prevent spam registrations
router.post('/register', authRateLimiter, waitlistController.register);

// GET /api/waitlist/stats?email=xxx - Get stats for an email
// 🔒 SECURITY: Rate limited to prevent email enumeration
router.get('/stats', generalRateLimiter, waitlistController.getStats);

// GET /api/waitlist/check/:code - Check if referral code is valid
router.get('/check/:code', generalRateLimiter, waitlistController.checkReferralCode);

// GET /api/waitlist/leaderboard - Get top referrers
router.get('/leaderboard', generalRateLimiter, waitlistController.getLeaderboard);

// GET /api/waitlist/tiers - Get reward tiers info
router.get('/tiers', generalRateLimiter, waitlistController.getRewardTiers);

// GET /api/waitlist/count - Get total count
router.get('/count', generalRateLimiter, waitlistController.getCount);

export default router;
