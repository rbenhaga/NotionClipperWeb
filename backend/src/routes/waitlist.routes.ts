/**
 * Waitlist Routes
 * Public endpoints for waitlist registration and referral tracking
 */

import { Router } from 'express';
import * as waitlistController from '../controllers/waitlist.controller.js';

const router = Router();

// Public routes (no auth required)

// POST /api/waitlist/register - Register for waitlist
router.post('/register', waitlistController.register);

// GET /api/waitlist/stats?email=xxx - Get stats for an email
router.get('/stats', waitlistController.getStats);

// GET /api/waitlist/check/:code - Check if referral code is valid
router.get('/check/:code', waitlistController.checkReferralCode);

// GET /api/waitlist/leaderboard - Get top referrers
router.get('/leaderboard', waitlistController.getLeaderboard);

// GET /api/waitlist/tiers - Get reward tiers info
router.get('/tiers', waitlistController.getRewardTiers);

// GET /api/waitlist/count - Get total count
router.get('/count', waitlistController.getCount);

export default router;
