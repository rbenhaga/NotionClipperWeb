/**
 * Waitlist Controller
 * Handles waitlist registration and referral tracking endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../types/index.js';
import * as waitlistService from '../services/waitlist.service.js';
import { logger } from '../utils/logger.js';

/**
 * POST /api/waitlist/register
 * Register for the waitlist
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, referralCode } = req.body;

  if (!email) {
    throw new AppError('Email requis', 400);
  }

  const stats = await waitlistService.registerWaitlist(email, referralCode);
  
  // Get total count for response
  const totalSignups = await waitlistService.getWaitlistCount();
  stats.totalSignups = totalSignups;

  logger.info(`Waitlist registration successful: ${email}`);

  sendSuccess(res, {
    message: 'Inscription réussie !',
    ...stats,
  }, 201);
});

/**
 * GET /api/waitlist/stats
 * Get waitlist stats for an email
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    throw new AppError('Email requis', 400);
  }

  const stats = await waitlistService.getWaitlistStats(email);
  
  if (!stats) {
    throw new AppError('Email non trouvé dans la liste d\'attente', 404);
  }

  // Get total count
  const totalSignups = await waitlistService.getWaitlistCount();
  stats.totalSignups = totalSignups;

  sendSuccess(res, stats);
});

/**
 * GET /api/waitlist/check/:code
 * Check if a referral code is valid
 */
export const checkReferralCode = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;

  if (!code) {
    throw new AppError('Code de parrainage requis', 400);
  }

  const entry = await waitlistService.getWaitlistByReferralCode(code);

  sendSuccess(res, {
    valid: !!entry,
    message: entry ? 'Code valide' : 'Code invalide',
  });
});

/**
 * GET /api/waitlist/leaderboard
 * Get top referrers leaderboard
 */
export const getLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
  const leaderboard = await waitlistService.getLeaderboard(10);
  const totalSignups = await waitlistService.getWaitlistCount();

  sendSuccess(res, {
    totalSignups,
    leaderboard,
  });
});

/**
 * GET /api/waitlist/tiers
 * Get reward tiers information
 */
export const getRewardTiers = asyncHandler(async (_req: Request, res: Response) => {
  const tiers = waitlistService.getRewardTiers();

  sendSuccess(res, { tiers });
});

/**
 * GET /api/waitlist/count
 * Get total waitlist count (public)
 */
export const getCount = asyncHandler(async (_req: Request, res: Response) => {
  const count = await waitlistService.getWaitlistCount();

  sendSuccess(res, { count });
});
