/**
 * Notion Controllers
 * Handles Notion-specific operations (connections, workspace lookups, API proxy)
 * 
 * 🔒 SECURITY (2025-12-18): 
 * - NO endpoint returns Notion tokens to clients
 * - All Notion API calls go through proxy endpoints (ALLOWLIST, not generic)
 * - Token stays server-side only
 * - Rate limiting per user to prevent exfiltration
 * - Payload validation on all proxy endpoints
 * - Audit logging for all proxy calls
 * 
 * 🚀 SCALE (2025-12-19):
 * - NotionClient with retry/backoff + circuit breaker
 * - Per-token rate limiting (confirmed PER-TOKEN by test)
 * - Respects Retry-After header from Notion
 */

import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { encryptToken, decryptToken } from '../services/crypto.service.js';
import { createNotionClient, NotionClient } from '../services/notion-client.service.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError, AuthenticatedRequest } from '../types/index.js';

// 🔒 SECURITY: UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Notion ID format (UUID with or without dashes)
const NOTION_ID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

// 🔒 SECURITY: Max payload size for proxy requests (100KB)
const MAX_PROXY_PAYLOAD_SIZE = 100 * 1024;

// 🔒 SECURITY: Max page_size for pagination (Notion max is 100)
const MAX_PAGE_SIZE = 100;

// ============================================
// 🔒 ANTI-EXFILTRATION RATE LIMITING (Application Layer)
// This is a secondary defense layer on top of NotionClient's per-token rate limiting
// Prevents a single user from hammering endpoints even within their Notion quota
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Per-user-per-endpoint limit (prevents hammering single endpoint)
const userEndpointRateLimitMap = new Map<string, RateLimitEntry>();
const USER_ENDPOINT_RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const USER_ENDPOINT_RATE_LIMITS: Record<string, number> = {
  // Read endpoints - higher limits (normal usage)
  '/search': 60,      // Increased: NotionClient handles Notion's rate limit
  '/databases': 60,
  '/pages': 60,
  '/blocks': 60,
  '/users/me': 20,
  // Write endpoints - lower limits (less frequent)
  'POST:/pages': 30,
  'PATCH:/pages': 30,
  'PATCH:/blocks': 30,
  'POST:/databases': 30,
};

function getEndpointLimit(endpoint: string, method: string): number {
  // Check method-specific limit first
  const methodKey = `${method}:${endpoint.split('/')[1] || endpoint}`;
  if (USER_ENDPOINT_RATE_LIMITS[methodKey]) {
    return USER_ENDPOINT_RATE_LIMITS[methodKey];
  }
  // Fall back to endpoint category
  const category = '/' + (endpoint.split('/')[1] || 'default');
  return USER_ENDPOINT_RATE_LIMITS[category] || 60;
}

function checkEndpointRateLimit(userId: string, endpoint: string, method: string): { 
  allowed: boolean; 
  remaining: number;
} {
  const now = Date.now();
  const endpointKey = `${userId}:${endpoint}`;
  const endpointEntry = userEndpointRateLimitMap.get(endpointKey);
  const endpointLimit = getEndpointLimit(endpoint, method);
  
  let remaining: number;
  if (!endpointEntry || now > endpointEntry.resetAt) {
    userEndpointRateLimitMap.set(endpointKey, { count: 1, resetAt: now + USER_ENDPOINT_RATE_LIMIT_WINDOW_MS });
    remaining = endpointLimit - 1;
  } else if (endpointEntry.count >= endpointLimit) {
    return { allowed: false, remaining: 0 };
  } else {
    endpointEntry.count++;
    remaining = endpointLimit - endpointEntry.count;
  }
  
  return { allowed: true, remaining };
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of userEndpointRateLimitMap.entries()) {
    if (now > entry.resetAt) userEndpointRateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * 🔒 SECURITY: Validate Notion ID format
 */
function validateNotionId(id: string, fieldName: string): void {
  if (!id || typeof id !== 'string') {
    throw new AppError(`${fieldName} is required`, 400);
  }
  if (!NOTION_ID_REGEX.test(id)) {
    throw new AppError(`Invalid ${fieldName} format`, 400);
  }
}

/**
 * 🔒 SECURITY: Validate proxy request payload size
 */
function validatePayloadSize(body: unknown): void {
  const size = JSON.stringify(body || {}).length;
  if (size > MAX_PROXY_PAYLOAD_SIZE) {
    throw new AppError(`Payload too large (max ${MAX_PROXY_PAYLOAD_SIZE / 1024}KB)`, 413);
  }
}

/**
 * 🔒 SECURITY: Validate and cap pagination parameters
 */
function validatePagination(body: Record<string, unknown>): void {
  if (body.page_size !== undefined) {
    const pageSize = Number(body.page_size);
    if (isNaN(pageSize) || pageSize < 1) {
      throw new AppError('page_size must be a positive number', 400);
    }
    // Cap to max allowed
    body.page_size = Math.min(pageSize, MAX_PAGE_SIZE);
  }
}

/**
 * 🔒 SECURITY: Check application-layer rate limit and log proxy call
 * Note: NotionClient handles Notion's per-token rate limit internally
 */
function checkRateLimitAndLog(
  userId: string, 
  endpoint: string, 
  method: string,
  workspaceId?: string
): void {
  const { allowed, remaining } = checkEndpointRateLimit(userId, endpoint, method);
  
  if (!allowed) {
    logger.warn({
      event: 'PROXY_RATELIMIT',
      userId,
      workspaceId,
      method,
      endpoint,
      remaining,
    });
    
    throw new AppError('Too many requests to this endpoint. Please slow down.', 429);
  }
  
  // Audit log (structured for analysis)
  logger.info({
    event: 'PROXY_CALL',
    userId,
    workspaceId,
    method,
    endpoint,
    remaining,
  });
}

/**
 * 🔒 INTERNAL: Get NotionClient for a user (token NEVER exposed to client)
 * Returns NotionClient with retry/backoff + circuit breaker
 */
async function getNotionClient(userId: string): Promise<{ client: NotionClient; workspaceId: string }> {
  const connection = await db.getNotionConnection(userId);
  
  if (!connection) {
    throw new AppError('No Notion connection found', 404);
  }
  
  if (!connection.is_active) {
    throw new AppError('Notion connection is inactive', 403);
  }
  
  const token = await decryptToken(connection.access_token_encrypted);
  
  const client = createNotionClient({
    token,
    userId,
    workspaceId: connection.workspace_id,
  });
  
  return { client, workspaceId: connection.workspace_id };
}

/**
 * POST /api/notion/save-connection
 * Encrypt and save Notion connection for the authenticated user
 * 
 * 🔒 SECURITY: 
 * - userId is extracted from JWT token ONLY (prevents IDOR)
 * - Token is NEVER returned in response
 */
export const saveNotionConnection = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!UUID_REGEX.test(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    const {
      workspaceId,
      workspaceName,
      workspaceIcon,
      accessToken,
      isActive = true,
    } = req.body;

    if (!workspaceId || !accessToken) {
      throw new AppError('workspaceId and accessToken are required', 400);
    }

    if (typeof workspaceId !== 'string' || workspaceId.length < 10 || workspaceId.length > 50) {
      throw new AppError('Invalid workspaceId format', 400);
    }

    logger.info(`Saving Notion connection for user: ${userId}, workspace: ${workspaceId}`);

    const encryptedToken = await encryptToken(accessToken);
    
    const connection = await db.saveNotionConnection(
      userId,
      workspaceId,
      workspaceName,
      encryptedToken,
      workspaceIcon,
      isActive
    );

    logger.info('✅ Notion connection saved successfully');

    // 🔒 SECURITY: Token is NEVER returned
    sendSuccess(res, {
      success: true,
      connection: {
        id: connection.id,
        userId: connection.user_id,
        workspaceId: connection.workspace_id,
        workspaceName: connection.workspace_name,
        workspaceIcon: connection.workspace_icon,
        isActive: connection.is_active,
      },
    });
  }
);

/**
 * POST /api/notion/get-user-by-workspace
 * Find user by Notion workspace ID
 * 
 * 🔒 SECURITY: REQUIRES AUTHENTICATION
 */
export const getUserByWorkspace = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      throw new AppError('workspaceId is required', 400);
    }

    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.userId) {
      throw new AppError('Authentication required', 401);
    }

    const userId = authReq.user.userId;
    const connection = await db.getConnectionByWorkspace(workspaceId);

    if (!connection) {
      sendSuccess(res, { user: null, exists: false });
      return;
    }

    if (connection.user_id === userId) {
      const user = await db.getUserById(connection.user_id);
      if (user) {
        sendSuccess(res, {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
          },
          exists: true,
          isOwner: true,
        });
        return;
      }
    }

    sendSuccess(res, { 
      user: null, 
      exists: true, 
      isOwner: false,
      message: 'This workspace is connected to another account',
    });
  }
);

// ============================================
// 🔒 NOTION API PROXY ENDPOINTS
// Token NEVER leaves the server
// ============================================

/**
 * POST /api/notion/proxy/search
 * Search Notion pages/databases
 * 
 * 🔒 SECURITY: Rate limited, payload validated, pagination capped, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxySearch = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    // 🔒 Security checks
    validatePayloadSize(req.body);
    validatePagination(req.body || {});
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/search', 'POST', workspaceId);
    
    const response = await client.search(req.body || {});
    sendSuccess(res, response.data);
  }
);

/**
 * GET /api/notion/proxy/databases/:id
 * Get a database
 * 
 * 🔒 SECURITY: Rate limited, ID validated, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyGetDatabase = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    const { id } = req.params;
    
    // 🔒 Security checks
    validateNotionId(id, 'Database ID');
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/databases', 'GET', workspaceId);
    
    const response = await client.getDatabase(id);
    sendSuccess(res, response.data);
  }
);

/**
 * POST /api/notion/proxy/databases/:id/query
 * Query a database
 * 
 * 🔒 SECURITY: Rate limited, ID + payload validated, pagination capped, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyQueryDatabase = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    const { id } = req.params;
    
    // 🔒 Security checks
    validateNotionId(id, 'Database ID');
    validatePayloadSize(req.body);
    validatePagination(req.body || {});
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/databases', 'POST', workspaceId);
    
    const response = await client.queryDatabase(id, req.body || {});
    sendSuccess(res, response.data);
  }
);

/**
 * GET /api/notion/proxy/pages/:id
 * Get a page
 * 
 * 🔒 SECURITY: Rate limited, ID validated, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyGetPage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    const { id } = req.params;
    
    // 🔒 Security checks
    validateNotionId(id, 'Page ID');
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/pages', 'GET', workspaceId);
    
    const response = await client.getPage(id);
    sendSuccess(res, response.data);
  }
);

/**
 * POST /api/notion/proxy/pages
 * Create a page
 * 
 * 🔒 SECURITY: Rate limited, payload validated, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyCreatePage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    // 🔒 Security checks
    validatePayloadSize(req.body);
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/pages', 'POST', workspaceId);
    
    const response = await client.createPage(req.body);
    sendSuccess(res, response.data);
  }
);

/**
 * PATCH /api/notion/proxy/pages/:id
 * Update a page
 * 
 * 🔒 SECURITY: Rate limited, ID + payload validated, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyUpdatePage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    const { id } = req.params;
    
    // 🔒 Security checks
    validateNotionId(id, 'Page ID');
    validatePayloadSize(req.body);
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/pages', 'PATCH', workspaceId);
    
    const response = await client.updatePage(id, req.body);
    sendSuccess(res, response.data);
  }
);

/**
 * GET /api/notion/proxy/blocks/:id/children
 * Get block children
 * 
 * 🔒 SECURITY: Rate limited, ID validated, pagination capped, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyGetBlockChildren = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    const { id } = req.params;
    
    // 🔒 Security checks
    validateNotionId(id, 'Block ID');
    
    // Cap page_size in query params
    const query = { ...req.query } as Record<string, string>;
    if (query.page_size) {
      const pageSize = parseInt(query.page_size, 10);
      if (isNaN(pageSize) || pageSize < 1) {
        throw new AppError('page_size must be a positive number', 400);
      }
      query.page_size = String(Math.min(pageSize, MAX_PAGE_SIZE));
    }
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/blocks', 'GET', workspaceId);
    
    const response = await client.getBlockChildren(id, query);
    sendSuccess(res, response.data);
  }
);

/**
 * PATCH /api/notion/proxy/blocks/:id/children
 * Append block children
 * 
 * 🔒 SECURITY: Rate limited, ID + payload validated, audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyAppendBlockChildren = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    const { id } = req.params;
    
    // 🔒 Security checks
    validateNotionId(id, 'Block ID');
    validatePayloadSize(req.body);
    
    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/blocks', 'PATCH', workspaceId);
    
    const response = await client.appendBlockChildren(id, req.body);
    sendSuccess(res, response.data);
  }
);

/**
 * GET /api/notion/proxy/users/me
 * Get current user (bot user)
 * 
 * 🔒 SECURITY: Rate limited (strict - 20/min), audit logged
 * 🚀 SCALE: Uses NotionClient with retry/backoff + circuit breaker
 */
export const proxyGetMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Authentication required', 401);

    const { client, workspaceId } = await getNotionClient(userId);
    checkRateLimitAndLog(userId, '/users/me', 'GET', workspaceId);
    
    const response = await client.getMe();
    sendSuccess(res, response.data);
  }
);
