/**
 * NotionClient Service
 * 
 * Production-grade Notion API client with:
 * - Per-token rate limiting (token bucket: ~2.5 rps sustained, 6 rps burst)
 * - Retry with exponential backoff + jitter
 * - Respect Retry-After header from Notion
 * - Circuit breaker on repeated 429s
 * - 401 handling for token invalidation
 * 
 * @see GPT_SCALE_CONTEXT.md for architecture details
 * @see notion-rate-limit-results-*.json for rate limit test results (PER-TOKEN confirmed)
 */

import { logger } from '../utils/logger.js';
import { AppError } from '../types/index.js';

// ============================================
// CONFIGURATION
// ============================================

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2022-06-28';

// Rate limiting (per-token, based on test results: ~3 rps limit)
const RATE_LIMIT_RPS = 2.5; // Conservative: 2.5 rps sustained
const RATE_LIMIT_BURST = 6; // Allow short bursts
const RATE_LIMIT_REFILL_MS = 1000 / RATE_LIMIT_RPS; // ~400ms per token

// Retry configuration
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 10000; // 10s max - NEVER sleep 200s in HTTP request!
const MAX_ACCEPTABLE_RETRY_AFTER_SEC = 10; // If Retry-After > 10s, fail fast
const JITTER_FACTOR = 0.3; // ±30% jitter

// Timeouts
const REQUEST_TIMEOUT_MS = 30000;

// ============================================
// TYPES
// ============================================

export interface NotionClientConfig {
  token: string;
  userId: string;
  workspaceId: string;
}

export interface NotionRequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}

export interface NotionResponse<T = unknown> {
  data: T;
  status: number;
  retryAfter?: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface CooldownState {
  cooldownUntil: number; // Timestamp when we can retry
  lastRetryAfter: number; // Last Retry-After value from Notion
}

// ============================================
// TOKEN BUCKET RATE LIMITER (Per-Token)
// ============================================

const tokenBuckets = new Map<string, TokenBucket>();
const cooldowns = new Map<string, CooldownState>();

function getTokenBucket(userId: string): TokenBucket {
  let bucket = tokenBuckets.get(userId);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_BURST, lastRefill: Date.now() };
    tokenBuckets.set(userId, bucket);
  }
  return bucket;
}

function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = elapsed / RATE_LIMIT_REFILL_MS;

  bucket.tokens = Math.min(RATE_LIMIT_BURST, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;
}

async function acquireToken(userId: string): Promise<void> {
  const bucket = getTokenBucket(userId);
  refillBucket(bucket);

  if (bucket.tokens < 1) {
    // Calculate wait time - but cap it to avoid blocking too long
    const waitMs = Math.min(Math.ceil((1 - bucket.tokens) * RATE_LIMIT_REFILL_MS), 2000);
    logger.debug({ event: 'RATE_LIMIT_WAIT', userId, waitMs, tokens: bucket.tokens });
    await sleep(waitMs);
    refillBucket(bucket);
  }

  bucket.tokens -= 1;
}

// ============================================
// COOLDOWN (Retry-After based, NOT counter-based)
// ============================================

/**
 * Check if user is in cooldown from a previous 429
 * If cooldown active, throws immediately with remaining time
 */
function checkCooldown(userId: string): void {
  const cooldown = cooldowns.get(userId);
  if (!cooldown) return;

  const now = Date.now();
  if (now < cooldown.cooldownUntil) {
    const remainingSec = Math.ceil((cooldown.cooldownUntil - now) / 1000);
    logger.warn({
      event: 'COOLDOWN_ACTIVE',
      userId,
      remainingSec,
      originalRetryAfter: cooldown.lastRetryAfter,
    });

    const error = new AppError(
      `Notion rate limit active. Retry in ${remainingSec}s`,
      429
    );
    (error as AppError & { retryAfter: number }).retryAfter = remainingSec;
    throw error;
  }

  // Cooldown expired, clear it
  cooldowns.delete(userId);
}

/**
 * Set cooldown based on Retry-After header from Notion
 */
function setCooldown(userId: string, retryAfterSec: number): void {
  const cooldownUntil = Date.now() + retryAfterSec * 1000;
  cooldowns.set(userId, {
    cooldownUntil,
    lastRetryAfter: retryAfterSec,
  });

  logger.warn({
    event: 'COOLDOWN_SET',
    userId,
    retryAfterSec,
    cooldownUntil: new Date(cooldownUntil).toISOString(),
  });
}

/**
 * Clear cooldown on successful request
 */
function clearCooldown(userId: string): void {
  if (cooldowns.has(userId)) {
    cooldowns.delete(userId);
    logger.info({ event: 'COOLDOWN_CLEARED', userId });
  }
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, retryAfter?: number): number | 'TOO_LONG' {
  // If Notion tells us when to retry
  if (retryAfter && retryAfter > 0) {
    // If Retry-After is too long, DON'T sleep - fail fast
    if (retryAfter > MAX_ACCEPTABLE_RETRY_AFTER_SEC) {
      return 'TOO_LONG';
    }
    return retryAfter * 1000;
  }

  // Exponential backoff with jitter
  const exponential = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
  const jitter = exponential * JITTER_FACTOR * (Math.random() * 2 - 1);
  return Math.round(exponential + jitter);
}

function isRetryableError(status: number): boolean {
  // 429 = rate limited, 5xx = server errors
  return status === 429 || (status >= 500 && status < 600);
}

// ============================================
// NOTION CLIENT CLASS
// ============================================

export class NotionClient {
  private token: string;
  private userId: string;
  private workspaceId: string;

  constructor(config: NotionClientConfig) {
    this.token = config.token;
    this.userId = config.userId;
    this.workspaceId = config.workspaceId;
  }

  /**
   * Make a request to Notion API with rate limiting, retry, and cooldown
   *
   * CRITICAL: Never sleeps more than MAX_ACCEPTABLE_RETRY_AFTER_SEC (10s)
   * If Notion says "retry in 200s", we fail fast and set cooldown
   */
  async request<T = unknown>(options: NotionRequestOptions): Promise<NotionResponse<T>> {
    const { method, endpoint, body, query } = options;

    // Check cooldown first (from previous 429 with long Retry-After)
    checkCooldown(this.userId);

    // Acquire rate limit token
    await acquireToken(this.userId);

    let lastError: Error | null = null;
    let lastStatus = 0;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.executeRequest<T>(method, endpoint, body, query);

        // Success - clear any cooldown
        clearCooldown(this.userId);

        return result;
      } catch (error) {
        lastError = error as Error;

        // Extract status from AppError
        if (error instanceof AppError) {
          lastStatus = error.statusCode;
        }

        // Check if we should retry
        if (!isRetryableError(lastStatus) || attempt === MAX_RETRIES) {
          break;
        }

        // Get Retry-After from error
        const retryAfter = (error as AppError & { retryAfter?: number }).retryAfter;

        // Calculate backoff
        const backoffResult = calculateBackoff(attempt, retryAfter);

        // If Retry-After is too long, DON'T sleep - set cooldown and fail fast
        if (backoffResult === 'TOO_LONG') {
          const retryAfterSec = retryAfter || 60; // Default 60s if somehow missing
          setCooldown(this.userId, retryAfterSec);

          logger.warn({
            event: 'NOTION_RETRY_AFTER_TOO_LONG',
            userId: this.userId,
            workspaceId: this.workspaceId,
            endpoint,
            retryAfterSec,
            action: 'FAIL_FAST_WITH_COOLDOWN',
          });

          // Propagate the error with retryAfter for client
          const cooldownError = new AppError(
            `Notion rate limit exceeded. Retry in ${retryAfterSec}s`,
            429
          );
          (cooldownError as AppError & { retryAfter: number }).retryAfter = retryAfterSec;
          throw cooldownError;
        }

        logger.warn({
          event: 'NOTION_RETRY',
          userId: this.userId,
          workspaceId: this.workspaceId,
          endpoint,
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
          status: lastStatus,
          backoffMs: backoffResult,
          retryAfter,
        });

        await sleep(backoffResult);

        // Re-acquire rate limit token for retry
        await acquireToken(this.userId);
      }
    }

    // All retries exhausted
    logger.error({
      event: 'NOTION_REQUEST_FAILED',
      userId: this.userId,
      workspaceId: this.workspaceId,
      endpoint,
      status: lastStatus,
      error: lastError?.message,
    });

    throw lastError;
  }

  /**
   * Execute a single request to Notion API
   */
  private async executeRequest<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>,
    query?: Record<string, string>
  ): Promise<NotionResponse<T>> {
    // Build URL
    let url = `${NOTION_API_BASE}${endpoint}`;
    if (query && Object.keys(query).length > 0) {
      url += '?' + new URLSearchParams(query).toString();
    }
    
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Notion-Version': NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      
      const latencyMs = Date.now() - startTime;
      const retryAfter = response.headers.get('retry-after');
      const retryAfterSec = retryAfter ? parseInt(retryAfter, 10) : undefined;
      
      // Log slow requests
      if (latencyMs > 5000) {
        logger.warn({
          event: 'NOTION_SLOW_REQUEST',
          userId: this.userId,
          endpoint,
          latencyMs,
        });
      }
      
      // Handle 401 - token invalid
      if (response.status === 401) {
        logger.error({
          event: 'NOTION_TOKEN_INVALID',
          userId: this.userId,
          workspaceId: this.workspaceId,
        });
        
        const error = new AppError('Notion token is invalid. Please reconnect your workspace.', 401);
        (error as AppError & { code: string }).code = 'NOTION_TOKEN_INVALID';
        throw error;
      }
      
      // Handle 429 - rate limited
      if (response.status === 429) {
        logger.warn({
          event: 'NOTION_RATE_LIMITED',
          userId: this.userId,
          workspaceId: this.workspaceId,
          endpoint,
          retryAfter: retryAfterSec,
        });
        
        const error = new AppError('Notion rate limit exceeded', 429);
        (error as AppError & { retryAfter?: number }).retryAfter = retryAfterSec;
        throw error;
      }
      
      // Parse response
      const data = await response.json() as T;
      
      // Handle other errors
      if (!response.ok) {
        const errorData = data as { message?: string; code?: string };
        throw new AppError(
          errorData.message || `Notion API error: ${response.status}`,
          response.status
        );
      }
      
      return {
        data,
        status: response.status,
        retryAfter: retryAfterSec,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error({
          event: 'NOTION_TIMEOUT',
          userId: this.userId,
          endpoint,
          timeoutMs: REQUEST_TIMEOUT_MS,
        });
        throw new AppError('Notion API request timed out', 504);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  async search(query: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'POST',
      endpoint: '/search',
      body: query,
    });
  }

  async getDatabase(databaseId: string): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/databases/${databaseId}`,
    });
  }

  async queryDatabase(databaseId: string, query: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'POST',
      endpoint: `/databases/${databaseId}/query`,
      body: query,
    });
  }

  async getPage(pageId: string): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/pages/${pageId}`,
    });
  }

  async createPage(properties: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'POST',
      endpoint: '/pages',
      body: properties,
    });
  }

  async updatePage(pageId: string, properties: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'PATCH',
      endpoint: `/pages/${pageId}`,
      body: properties,
    });
  }

  async getBlockChildren(blockId: string, query?: Record<string, string>): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/blocks/${blockId}/children`,
      query,
    });
  }

  async appendBlockChildren(blockId: string, children: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'PATCH',
      endpoint: `/blocks/${blockId}/children`,
      body: children,
    });
  }

  async getMe(): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: '/users/me',
    });
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a NotionClient instance for a user
 * Token should be decrypted before passing here
 */
export function createNotionClient(config: NotionClientConfig): NotionClient {
  return new NotionClient(config);
}

// ============================================
// CLEANUP (for graceful shutdown)
// ============================================

export function clearRateLimitState(): void {
  tokenBuckets.clear();
  cooldowns.clear();
  logger.info({ event: 'NOTION_CLIENT_STATE_CLEARED' });
}

// Periodic cleanup of stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 10 * 60 * 1000; // 10 minutes

  for (const [userId, bucket] of tokenBuckets.entries()) {
    if (now - bucket.lastRefill > staleThreshold) {
      tokenBuckets.delete(userId);
    }
  }

  // Clean up expired cooldowns
  for (const [userId, cooldown] of cooldowns.entries()) {
    if (now > cooldown.cooldownUntil) {
      cooldowns.delete(userId);
    }
  }
}, 5 * 60 * 1000);
