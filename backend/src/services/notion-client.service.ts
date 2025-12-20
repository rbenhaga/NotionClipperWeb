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
import { config } from '../config/index.js';
import crypto from 'crypto';
import { notionMetrics } from '../observability/metrics.js';
import { recordRateLimitSignal } from './notion-sentinel.service.js';

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
const MAX_RETRIES_READ = config.notion.readMaxRetries;
const BASE_BACKOFF_MS = config.notion.backoffBaseMs;
const MAX_BACKOFF_MS = config.notion.backoffMaxMs; // 10s max - NEVER sleep 200s in HTTP request!
const MAX_ACCEPTABLE_RETRY_AFTER_SEC = config.notion.cooldownMinSeconds; // If Retry-After > threshold, fail fast
const JITTER_FACTOR = 0.3; // ±30% jitter

// Timeouts
const REQUEST_TIMEOUT_MS = 30000;
const MAX_IN_FLIGHT = config.notion.maxInFlightRequests;

const CIRCUIT_FAILURE_THRESHOLD = config.notion.circuitBreaker.failureThreshold;
const CIRCUIT_RESET_MS = config.notion.circuitBreaker.resetMs;
const CIRCUIT_HALF_OPEN_CALLS = config.notion.circuitBreaker.halfOpenMaxCalls;

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
  requestType?: 'read' | 'write';
  requestId?: string;
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

type CircuitStateStatus = 'closed' | 'open' | 'half-open';

interface CircuitState {
  state: CircuitStateStatus;
  failureCount: number;
  openedAt?: number;
  nextAttemptAt?: number;
  halfOpenCalls: number;
}

// ============================================
// TOKEN BUCKET RATE LIMITER (Per-Token)
// ============================================

const tokenBuckets = new Map<string, TokenBucket>();
const cooldowns = new Map<string, CooldownState>();
const circuitStates = new Map<string, CircuitState>();

let globalInFlight = 0;

function getTokenBucket(tokenHash: string): TokenBucket {
  let bucket = tokenBuckets.get(tokenHash);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_BURST, lastRefill: Date.now() };
    tokenBuckets.set(tokenHash, bucket);
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

async function acquireToken(tokenHash: string): Promise<void> {
  const bucket = getTokenBucket(tokenHash);
  refillBucket(bucket);

  if (bucket.tokens < 1) {
    // Calculate wait time - but cap it to avoid blocking too long
    const waitMs = Math.min(Math.ceil((1 - bucket.tokens) * RATE_LIMIT_REFILL_MS), 2000);
    logger.debug({ event: 'RATE_LIMIT_WAIT', tokenHash, waitMs, tokens: bucket.tokens });
    await sleep(waitMs);
    refillBucket(bucket);
  }

  bucket.tokens -= 1;
}

function acquireGlobalSlot(): void {
  if (globalInFlight >= MAX_IN_FLIGHT) {
    throw new AppError('Server is busy processing Notion requests. Please retry shortly.', 503, 'SERVER_BUSY');
  }
  globalInFlight += 1;
  notionMetrics.recordInFlight(globalInFlight);
}

function releaseGlobalSlot(): void {
  globalInFlight = Math.max(0, globalInFlight - 1);
  notionMetrics.recordInFlight(globalInFlight);
}

// ============================================
// COOLDOWN (Retry-After based, NOT counter-based)
// ============================================

/**
 * Check if user is in cooldown from a previous 429
 * If cooldown active, throws immediately with remaining time
 */
function checkCooldown(tokenHash: string): void {
  const cooldown = cooldowns.get(tokenHash);
  if (!cooldown) return;

  const now = Date.now();
  if (now < cooldown.cooldownUntil) {
    const remainingSec = Math.ceil((cooldown.cooldownUntil - now) / 1000);
    logger.warn({
      event: 'COOLDOWN_ACTIVE',
      tokenHash,
      remainingSec,
      originalRetryAfter: cooldown.lastRetryAfter,
    });
    notionMetrics.recordCooldown(tokenHash, true);

    const error = new AppError(
      `Notion rate limit active. Retry in ${remainingSec}s`,
      429,
      'NOTION_COOLDOWN'
    );
    (error as AppError & { retryAfter: number }).retryAfter = remainingSec;
    throw error;
  }

  // Cooldown expired, clear it
  cooldowns.delete(tokenHash);
}

/**
 * Set cooldown based on Retry-After header from Notion
 */
function setCooldown(tokenHash: string, retryAfterSec: number): void {
  const cooldownUntil = Date.now() + retryAfterSec * 1000;
  cooldowns.set(tokenHash, {
    cooldownUntil,
    lastRetryAfter: retryAfterSec,
  });

  logger.warn({
    event: 'COOLDOWN_SET',
    tokenHash,
    retryAfterSec,
    cooldownUntil: new Date(cooldownUntil).toISOString(),
  });
  notionMetrics.recordCooldown(tokenHash, true);
  recordRateLimitSignal({ tokenHash, retryAfter: retryAfterSec });
}

/**
 * Clear cooldown on successful request
 */
function clearCooldown(tokenHash: string): void {
  if (cooldowns.has(tokenHash)) {
    cooldowns.delete(tokenHash);
    logger.info({ event: 'COOLDOWN_CLEARED', tokenHash });
    notionMetrics.recordCooldown(tokenHash, false);
  }
}

function getCircuit(tokenHash: string): CircuitState {
  const state = circuitStates.get(tokenHash);
  if (state) return state;
  const fresh: CircuitState = { state: 'closed', failureCount: 0, halfOpenCalls: 0 };
  circuitStates.set(tokenHash, fresh);
  return fresh;
}

function assertCircuitAvailable(tokenHash: string): void {
  const state = getCircuit(tokenHash);
  if (state.state === 'open') {
    const now = Date.now();
    if (state.nextAttemptAt && now >= state.nextAttemptAt) {
      state.state = 'half-open';
      state.failureCount = 0;
      state.halfOpenCalls = 0;
      circuitStates.set(tokenHash, state);
      return;
    }
    throw new AppError('Notion service temporarily unavailable', 503, 'NOTION_CIRCUIT_OPEN');
  }
}

function recordCircuitFailure(tokenHash: string, context: Record<string, unknown>): void {
  const state = getCircuit(tokenHash);
  state.failureCount += 1;
  if (state.state === 'half-open') {
    state.state = 'open';
    state.openedAt = Date.now();
    state.nextAttemptAt = Date.now() + CIRCUIT_RESET_MS;
  } else if (state.failureCount >= CIRCUIT_FAILURE_THRESHOLD) {
    state.state = 'open';
    state.openedAt = Date.now();
    state.nextAttemptAt = Date.now() + CIRCUIT_RESET_MS;
  }
  circuitStates.set(tokenHash, state);
  if (state.state === 'open') {
    notionMetrics.recordCircuit(tokenHash, true);
  }
  logger.warn({
    event: 'NOTION_CIRCUIT_UPDATE',
    tokenHash,
    state: state.state,
    failureCount: state.failureCount,
    ...context,
  });
}

function recordCircuitSuccess(tokenHash: string): void {
  const state = getCircuit(tokenHash);
  state.state = 'closed';
  state.failureCount = 0;
  state.halfOpenCalls = 0;
  delete state.openedAt;
  delete state.nextAttemptAt;
  circuitStates.set(tokenHash, state);
  notionMetrics.recordCircuit(tokenHash, false);
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

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================
// NOTION CLIENT CLASS
// ============================================

export class NotionClient {
  private token: string;
  private userId: string;
  private workspaceId: string;
  private tokenHash: string;

  constructor(config: NotionClientConfig) {
    this.token = config.token;
    this.userId = config.userId;
    this.workspaceId = config.workspaceId;
    this.tokenHash = hashToken(config.token);
  }

  /**
   * Make a request to Notion API with rate limiting, retry, and cooldown
   *
   * CRITICAL: Never sleeps more than MAX_ACCEPTABLE_RETRY_AFTER_SEC (10s)
   * If Notion says "retry in 200s", we fail fast and set cooldown
   */
  async request<T = unknown>(options: NotionRequestOptions): Promise<NotionResponse<T>> {
    const { method, endpoint, body, query, requestType = 'read', requestId = crypto.randomUUID() } = options;

    // Check cooldown first (from previous 429 with long Retry-After)
    checkCooldown(this.tokenHash);

    // Circuit breaker guard
    assertCircuitAvailable(this.tokenHash);
    const circuitState = getCircuit(this.tokenHash);
    if (circuitState.state === 'half-open') {
      if (circuitState.halfOpenCalls >= CIRCUIT_HALF_OPEN_CALLS) {
        throw new AppError('Notion circuit half-open limit reached', 503, 'NOTION_CIRCUIT_OPEN');
      }
      circuitState.halfOpenCalls += 1;
      circuitStates.set(this.tokenHash, circuitState);
    }

    // Acquire global backpressure slot before token bucket to fail fast
    acquireGlobalSlot();

    // Acquire rate limit token
    await acquireToken(this.tokenHash);

    const maxRetries = requestType === 'write' ? 0 : MAX_RETRIES_READ;
    let lastError: Error | null = null;
    let lastStatus = 0;

    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await this.executeRequest<T>(method, endpoint, body, query, requestId, requestType);

          // Success - clear any cooldown and reset circuit
          clearCooldown(this.tokenHash);
          recordCircuitSuccess(this.tokenHash);

          return result;
        } catch (error) {
          lastError = error as Error;

          // Extract status from AppError
          if (error instanceof AppError) {
            lastStatus = error.statusCode;
          }

          // If breaker should open on this error, record
          if (isRetryableError(lastStatus)) {
            recordCircuitFailure(this.tokenHash, { status: lastStatus, endpoint, requestId });
          }

          // Check if we should retry
          if (!isRetryableError(lastStatus) || attempt === maxRetries) {
            break;
          }

          // Half-open allows limited calls
          const circuit = getCircuit(this.tokenHash);
          if (circuit.state === 'half-open' && circuit.halfOpenCalls >= CIRCUIT_HALF_OPEN_CALLS) {
            throw new AppError('Notion circuit half-open limit reached', 503, 'NOTION_CIRCUIT_OPEN');
          }
          if (circuit.state === 'half-open') {
            circuit.halfOpenCalls += 1;
            circuitStates.set(this.tokenHash, circuit);
          }

          // Get Retry-After from error
          const retryAfter = (error as AppError & { retryAfter?: number }).retryAfter;

          // Calculate backoff
          const backoffResult = calculateBackoff(attempt, retryAfter);

          // If Retry-After is too long, DON'T sleep - set cooldown and fail fast
          if (backoffResult === 'TOO_LONG') {
            const retryAfterSec = retryAfter || config.notion.maxRetryAfterSeconds;
            setCooldown(this.tokenHash, retryAfterSec);

            logger.warn({
              event: 'NOTION_RETRY_AFTER_TOO_LONG',
              tokenHash: this.tokenHash,
              userId: this.userId,
              workspaceId: this.workspaceId,
              endpoint,
              retryAfterSec,
              action: 'FAIL_FAST_WITH_COOLDOWN',
              requestId,
            });

            notionMetrics.recordRetryAfter(retryAfterSec);

            // Propagate the error with retryAfter for client
            const cooldownError = new AppError(
              `Notion rate limit exceeded. Retry in ${retryAfterSec}s`,
              429,
              'NOTION_COOLDOWN'
            );
            (cooldownError as AppError & { retryAfter: number }).retryAfter = retryAfterSec;
            throw cooldownError;
          }

          logger.warn({
            event: 'NOTION_RETRY',
            tokenHash: this.tokenHash,
            userId: this.userId,
            workspaceId: this.workspaceId,
            endpoint,
            attempt: attempt + 1,
            maxRetries,
            status: lastStatus,
            backoffMs: backoffResult,
            retryAfter,
            requestId,
          });

          notionMetrics.recordRetry(endpoint, lastStatus);

          await sleep(backoffResult);

          // Re-acquire rate limit token for retry
          await acquireToken(this.tokenHash);
        }
      }
    } finally {
      releaseGlobalSlot();
    }

    // All retries exhausted
    logger.error({
      event: 'NOTION_REQUEST_FAILED',
      tokenHash: this.tokenHash,
      userId: this.userId,
      workspaceId: this.workspaceId,
      endpoint,
      status: lastStatus,
      error: lastError?.message,
      requestId,
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
    query?: Record<string, string>,
    requestId?: string,
    requestType: 'read' | 'write' = 'read'
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
          tokenHash: this.tokenHash,
          endpoint,
          latencyMs,
          requestId,
        });
      }
      
      // Handle 401 - token invalid
      if (response.status === 401) {
        logger.error({
          event: 'NOTION_TOKEN_INVALID',
          tokenHash: this.tokenHash,
          userId: this.userId,
          workspaceId: this.workspaceId,
          requestId,
        });
        
        const error = new AppError('Notion token is invalid. Please reconnect your workspace.', 401);
        (error as AppError & { code: string }).code = 'NOTION_TOKEN_INVALID';
        notionMetrics.recordRequest(endpoint, method, response.status, latencyMs, requestType);
        throw error;
      }
      
      // Handle 429 - rate limited
      if (response.status === 429) {
        logger.warn({
          event: 'NOTION_RATE_LIMITED',
          tokenHash: this.tokenHash,
          userId: this.userId,
          workspaceId: this.workspaceId,
          endpoint,
          retryAfter: retryAfterSec,
          requestId,
        });
        notionMetrics.recordRetryAfter(retryAfterSec || 0);
        recordRateLimitSignal({ tokenHash: this.tokenHash, retryAfter: retryAfterSec });
        
        const error = new AppError('Notion rate limit exceeded', 429);
        (error as AppError & { retryAfter?: number }).retryAfter = retryAfterSec;
        notionMetrics.recordRequest(endpoint, method, response.status, latencyMs, requestType);
        throw error;
      }
      
      // Parse response
      const data = await response.json() as T;
      
      // Handle other errors
      if (!response.ok) {
        const errorData = data as { message?: string; code?: string };
        notionMetrics.recordRequest(endpoint, method, response.status, latencyMs, requestType);
        throw new AppError(
          errorData.message || `Notion API error: ${response.status}`,
          response.status
        );
      }
      
      notionMetrics.recordRequest(endpoint, method, response.status, latencyMs, requestType);

      return {
        data,
        status: response.status,
        retryAfter: retryAfterSec,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error({
          event: 'NOTION_TIMEOUT',
          tokenHash: this.tokenHash,
          endpoint,
          timeoutMs: REQUEST_TIMEOUT_MS,
          requestId,
        });
        notionMetrics.recordRequest(endpoint, method, 504, Date.now() - startTime, requestType);
        throw new AppError('Notion API request timed out', 504);
      }
      notionMetrics.recordRequest(endpoint, method, (error as AppError)?.statusCode || 500, Date.now() - startTime, requestType);
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
      requestType: 'read',
    });
  }

  async getDatabase(databaseId: string): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/databases/${databaseId}`,
      requestType: 'read',
    });
  }

  async queryDatabase(databaseId: string, query: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'POST',
      endpoint: `/databases/${databaseId}/query`,
      body: query,
      requestType: 'read',
    });
  }

  async getPage(pageId: string): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/pages/${pageId}`,
      requestType: 'read',
    });
  }

  async createPage(properties: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'POST',
      endpoint: '/pages',
      body: properties,
      requestType: 'write',
    });
  }

  async updatePage(pageId: string, properties: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'PATCH',
      endpoint: `/pages/${pageId}`,
      body: properties,
      requestType: 'write',
    });
  }

  async getBlockChildren(blockId: string, query?: Record<string, string>): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/blocks/${blockId}/children`,
      query,
      requestType: 'read',
    });
  }

  async appendBlockChildren(blockId: string, children: Record<string, unknown>): Promise<NotionResponse> {
    return this.request({
      method: 'PATCH',
      endpoint: `/blocks/${blockId}/children`,
      body: children,
      requestType: 'write',
    });
  }

  async getMe(): Promise<NotionResponse> {
    return this.request({
      method: 'GET',
      endpoint: '/users/me',
      requestType: 'read',
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
  circuitStates.clear();
  globalInFlight = 0;
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
  for (const [tokenHash, state] of circuitStates.entries()) {
    if (state.state === 'open' && state.nextAttemptAt && now > state.nextAttemptAt + CIRCUIT_RESET_MS) {
      circuitStates.delete(tokenHash);
    }
  }
}, 5 * 60 * 1000);
