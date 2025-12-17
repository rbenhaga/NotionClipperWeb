/**
 * API Routes
 * Central router for all API endpoints
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import stripeRoutes from './stripe.routes.js';
import userRoutes from './user.routes.js';
import notionRoutes from './notion.routes.js';
import usageRoutes from './usage.routes.js';
import activityRoutes from './activity.routes.js';
import workspaceRoutes from './workspace.routes.js';
import analyticsRoutes from './analytics.routes.js';
import waitlistRoutes from './waitlist.routes.js';

const router = Router();

// Health check (public)
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'notion-clipper-backend',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/stripe', stripeRoutes);
router.use('/user', userRoutes);
// NOTE: Webhook routes are mounted separately in server.ts BEFORE body parsers
// This is critical for Stripe signature verification which needs raw body
router.use('/notion', notionRoutes);
router.use('/usage', usageRoutes);
router.use('/activity', activityRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/waitlist', waitlistRoutes);

export default router;
