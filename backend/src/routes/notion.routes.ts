/**
 * Notion Routes
 * Handles Notion-specific operations (connections, workspace lookups, API proxy)
 * 
 * 🔒 SECURITY (2025-12-18): 
 * - NO endpoint returns Notion tokens to clients
 * - All Notion API calls go through proxy endpoints
 * - Token stays server-side only
 */

import { Router } from 'express';
import {
  saveNotionConnection,
  getUserByWorkspace,
  // Proxy endpoints
  proxySearch,
  proxyGetDatabase,
  proxyQueryDatabase,
  proxyGetPage,
  proxyCreatePage,
  proxyUpdatePage,
  proxyGetBlockChildren,
  proxyAppendBlockChildren,
  proxyGetMe,
} from '../controllers/notion.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { generalRateLimiter, authRateLimiter } from '../middleware/rate-limit.middleware.js';
import { notionDegradedGuard } from '../middleware/notion-mode.middleware.js';

const router = Router();

// ============================================
// CONNECTION MANAGEMENT
// ============================================

/**
 * POST /api/notion/save-connection
 * Encrypt and save Notion connection
 * 🔒 Token is NEVER returned in response
 */
router.post('/save-connection', authenticateToken, generalRateLimiter, saveNotionConnection);

/**
 * POST /api/notion/get-user-by-workspace
 * Find user by Notion workspace ID
 * 🔒 Requires authentication
 */
router.post('/get-user-by-workspace', authenticateToken, authRateLimiter, getUserByWorkspace);

// ============================================
// 🔒 NOTION API PROXY
// Token NEVER leaves the server - all calls proxied
// ============================================

/**
 * POST /api/notion/proxy/search
 * Search Notion pages/databases
 */
router.post('/proxy/search', authenticateToken, generalRateLimiter, notionDegradedGuard, proxySearch);

/**
 * GET /api/notion/proxy/databases/:id
 * Get a database
 */
router.get('/proxy/databases/:id', authenticateToken, generalRateLimiter, notionDegradedGuard, proxyGetDatabase);

/**
 * POST /api/notion/proxy/databases/:id/query
 * Query a database
 */
router.post('/proxy/databases/:id/query', authenticateToken, generalRateLimiter, notionDegradedGuard, proxyQueryDatabase);

/**
 * GET /api/notion/proxy/pages/:id
 * Get a page
 */
router.get('/proxy/pages/:id', authenticateToken, generalRateLimiter, notionDegradedGuard, proxyGetPage);

/**
 * POST /api/notion/proxy/pages
 * Create a page
 */
router.post('/proxy/pages', authenticateToken, generalRateLimiter, proxyCreatePage);

/**
 * PATCH /api/notion/proxy/pages/:id
 * Update a page
 */
router.patch('/proxy/pages/:id', authenticateToken, generalRateLimiter, proxyUpdatePage);

/**
 * GET /api/notion/proxy/blocks/:id/children
 * Get block children
 */
router.get('/proxy/blocks/:id/children', authenticateToken, generalRateLimiter, notionDegradedGuard, proxyGetBlockChildren);

/**
 * PATCH /api/notion/proxy/blocks/:id/children
 * Append block children
 */
router.patch('/proxy/blocks/:id/children', authenticateToken, generalRateLimiter, proxyAppendBlockChildren);

/**
 * GET /api/notion/proxy/users/me
 * Get current user (bot user)
 */
router.get('/proxy/users/me', authenticateToken, generalRateLimiter, notionDegradedGuard, proxyGetMe);

// ============================================
// 🚫 REMOVED ENDPOINTS (security risk)
// ============================================
// GET /api/notion/get-token - REMOVED: Token should never be sent to client
// Clients should use proxy endpoints instead

export default router;
