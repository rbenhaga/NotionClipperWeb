/**
 * Notion Routes
 * Handles Notion-specific operations (tokens, connections, workspace lookups)
 */

import { Router } from 'express';
import {
  getNotionToken,
  saveNotionConnection,
  getUserByWorkspace,
} from '../controllers/notion.controller.js';
import { generalRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

/**
 * POST /api/notion/get-token
 * Get and decrypt Notion access token for a user
 * Body: { userId: string }
 */
router.post('/get-token', generalRateLimiter, getNotionToken);

/**
 * POST /api/notion/save-connection
 * Encrypt and save Notion connection
 * Body: { userId, workspaceId, workspaceName, workspaceIcon?, accessToken, isActive? }
 */
router.post('/save-connection', generalRateLimiter, saveNotionConnection);

/**
 * POST /api/notion/get-user-by-workspace
 * Find user by Notion workspace ID
 * Body: { workspaceId: string }
 */
router.post('/get-user-by-workspace', generalRateLimiter, getUserByWorkspace);

export default router;
