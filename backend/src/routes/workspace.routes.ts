/**
 * Workspace Routes
 * Manages Notion workspace connections
 * 🔒 SECURITY: All routes require auth + rate limiting
 */

import { Router } from 'express';
import {
  listWorkspaces,
  getActiveWorkspace,
  setDefaultWorkspace,
  checkWorkspaceAvailability,
  disconnectWorkspace,
  getWorkspaceHistory,
  reconnectWorkspace
} from '../controllers/workspace.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { generalRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

// 🔒 SECURITY: Apply rate limiting to all workspace routes
router.use(generalRateLimiter);

/**
 * GET /api/workspace/list
 * Get all workspaces for the current user
 */
router.get('/list', authenticateToken, listWorkspaces);

/**
 * GET /api/workspace/active
 * Get the active (default) workspace with token
 */
router.get('/active', authenticateToken, getActiveWorkspace);

/**
 * POST /api/workspace/set-default
 * Set a workspace as the default
 */
router.post('/set-default', authenticateToken, setDefaultWorkspace);

/**
 * POST /api/workspace/check-availability
 * Check if a workspace can be connected (anti-abuse)
 */
router.post('/check-availability', authenticateToken, checkWorkspaceAvailability);

/**
 * POST /api/workspace/disconnect
 * Disconnect a workspace
 */
router.post('/disconnect', authenticateToken, disconnectWorkspace);

/**
 * GET /api/workspace/history
 * Get workspace connection history
 */
router.get('/history', authenticateToken, getWorkspaceHistory);

/**
 * POST /api/workspace/reconnect
 * Reconnect a previously disconnected workspace
 */
router.post('/reconnect', authenticateToken, reconnectWorkspace);

export default router;
