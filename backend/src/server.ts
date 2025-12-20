/**
 * Express Server
 * Main entry point for the backend API
 */

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, initializeSecrets } from './config/index.js';
import { logger, morganStream } from './utils/logger.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalRateLimiter } from './middleware/rate-limit.middleware.js';
import routes from './routes/index.js';
import webhookRoutes from './routes/webhook.routes.js';
import { startNotionWriteWorker } from './services/notion-write.service.js';
import { metricsRouter } from './observability/metrics.js';

/**
 * Start the server
 * Loads secrets from Supabase Vault before starting
 */
async function startServer() {
  // Load secrets from Supabase Vault
  await initializeSecrets();

  const app = express();

  // ============================================
  // MIDDLEWARE
  // ============================================

  // Security headers
  app.use(helmet());

  // CORS
  app.use(corsMiddleware);

  // Request logging
  app.use(morgan('combined', { stream: morganStream }));

  // ⚠️ CRITICAL: Webhook routes MUST be mounted BEFORE body parsers
  // Stripe webhooks need raw body for signature verification
  app.use('/api/webhooks', webhookRoutes);

  // Body parsing (applied to all routes EXCEPT webhooks)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  app.use(generalRateLimiter);

  // ============================================
  // ROUTES
  // ============================================

  // Health check (before rate limiting)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    });
  });

  // API routes
  app.use('/api', routes);

  // Metrics endpoint (observability)
  app.use(metricsRouter());

  // ============================================
  // ERROR HANDLING
  // ============================================

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  // ============================================
  // SERVER START
  // ============================================

  const server = app.listen(config.port, config.host, () => {
    logger.info(`🚀 Server started successfully`);
    logger.info(`   Environment: ${config.env}`);
    logger.info(`   URL: http://${config.host}:${config.port}`);
    logger.info(`   Health check: http://${config.host}:${config.port}/health`);
    logger.info(`   API endpoints: http://${config.host}:${config.port}/api`);

    // Log critical configuration status
    const stripeStatus = config.stripe.prices.monthly && config.stripe.prices.annual ? '✅ Ready' : '❌ Missing Price IDs';
    logger.info(`   Stripe Config: ${stripeStatus}`);

    // Start the Notion write queue worker
    startNotionWriteWorker().catch((err) => {
      logger.error('Failed to start Notion write worker:', err);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  return app;
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
