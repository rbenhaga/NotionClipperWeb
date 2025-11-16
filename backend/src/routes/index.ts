/**
 * API Routes
 * Central router for all API endpoints
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import stripeRoutes from './stripe.routes.js';
import userRoutes from './user.routes.js';
import webhookRoutes from './webhook.routes.js';

const router = Router();

// Health check (public)
router.get('/health', (req, res) => {
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
router.use('/webhooks', webhookRoutes);

export default router;
