/**
 * Supabase Edge Function: Get OAuth Secrets
 * Returns OAuth secrets from Supabase Vault for backend VPS
 * 
 * 🔒 SECURITY HARDENED (2025-12-18):
 * - POST only (no GET/OPTIONS for secrets)
 * - Anti-browser barrier (reject if Origin header present)
 * - Single auth mechanism: BACKEND_SHARED_SECRET only (no fallback)
 * - Constant-time comparison to prevent timing attacks
 * - Naive rate limiting (in-memory)
 * - Structured logging
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ============================================
// 🔒 SECURITY: Constant-time string comparison
// ============================================
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to maintain constant time
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ============================================
// 🔒 SECURITY: Rate limiting on AUTH FAILURES ONLY
// This prevents brute-force attacks without blocking legitimate backend
// ============================================
const failedAuthMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_FAILURES = 5; // 5 failed attempts per minute per "identity"

/**
 * Check if this identity has exceeded failed auth attempts
 * ONLY called AFTER auth failure - never blocks legitimate requests
 */
function checkFailedAuthLimit(identifier: string): { blocked: boolean; failures: number } {
  const now = Date.now();
  const entry = failedAuthMap.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    return { blocked: false, failures: 0 };
  }
  
  return { 
    blocked: entry.count >= RATE_LIMIT_MAX_FAILURES, 
    failures: entry.count 
  };
}

/**
 * Record a failed auth attempt
 * Called ONLY on 401/403 responses
 */
function recordFailedAuth(identifier: string): void {
  const now = Date.now();
  const entry = failedAuthMap.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    failedAuthMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count++;
  }
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of failedAuthMap.entries()) {
    if (now > entry.resetAt) {
      failedAuthMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// 🔒 SECURITY: Structured logging
// ============================================
function logSecurity(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: Record<string, unknown>) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    function: 'get-oauth-secrets',
    message,
    ...data,
  };
  console.log(JSON.stringify(log));
}

// ============================================
// 🔒 SECURITY: Origin allowlist
// PROD: empty = reject all browser requests
// DEV: allow localhost for testing
// ============================================
const isProd = Deno.env.get('ENVIRONMENT') === 'production';
const ORIGIN_ALLOWLIST: string[] = isProd 
  ? [] // PROD: no browser origins allowed
  : ['http://localhost:3001', 'http://localhost:5173']; // DEV: allow local testing

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  
  // 🔒 SECURITY: Reject all methods except POST
  // No OPTIONS/CORS - this is a server-to-server endpoint
  if (req.method !== 'POST') {
    logSecurity('WARN', 'Method not allowed', { requestId, method: req.method });
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', 'Allow': 'POST' } }
    );
  }

  // 🔒 SECURITY: Anti-browser barrier with allowlist
  // If Origin header is present AND not in allowlist => reject
  // Why allowlist instead of blanket reject: some proxies may add Origin header
  const origin = req.headers.get('Origin');
  if (origin && !ORIGIN_ALLOWLIST.includes(origin)) {
    logSecurity('WARN', 'Browser request rejected - origin not in allowlist', { requestId, origin });
    return new Response(
      JSON.stringify({ error: 'Forbidden - browser requests not allowed' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 🔒 SECURITY: Check if this identity is rate-limited (failed auth only)
  // 
  // IP Header Trust Hierarchy (Supabase Edge = Deno Deploy = Cloudflare):
  // 1. cf-connecting-ip: Set by Cloudflare, CANNOT be spoofed by client
  // 2. x-real-ip: Set by Supabase/Deno Deploy infrastructure, trusted
  // 3. Fallback to 'unknown' - we do NOT trust x-forwarded-for (spoofable)
  //
  // Why not x-forwarded-for? It can be set by the client:
  //   curl -H "X-Forwarded-For: 1.2.3.4" ... 
  // Cloudflare overwrites it, but we can't guarantee all paths go through CF.
  //
  const clientIP = req.headers.get('cf-connecting-ip') 
    || req.headers.get('x-real-ip')
    || 'unknown';
  
  // If we can't identify the client, use a hash of the auth header as fallback
  // This still provides some rate limiting even without IP
  let rateLimitKey: string;
  if (clientIP !== 'unknown') {
    rateLimitKey = `ip:${clientIP}`;
  } else {
    // Hash the auth header to create a stable identifier without logging the secret
    const authHeader = req.headers.get('Authorization') || 'no-auth';
    const encoder = new TextEncoder();
    const data = encoder.encode(authHeader);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
    rateLimitKey = `auth:${hashHex}`;
  }
  
  const { blocked, failures } = checkFailedAuthLimit(rateLimitKey);
  if (blocked) {
    logSecurity('WARN', 'Rate limited due to failed auth attempts', { requestId, rateLimitKey, failures });
    return new Response(
      JSON.stringify({ error: 'Too many failed attempts. Try again later.' }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '60',
        } 
      }
    );
  }

  try {
    // 🔒 SECURITY: Verify authorization via X-Backend-Secret header
    // Note: Authorization header contains Supabase anon key (required by gateway)
    // Our custom auth is in X-Backend-Secret header
    const backendSecretHeader = req.headers.get('X-Backend-Secret') || '';
    
    if (!backendSecretHeader) {
      logSecurity('WARN', 'Missing X-Backend-Secret header', { requestId });
      recordFailedAuth(rateLimitKey); // Record failure for rate limiting
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = backendSecretHeader;
    
    // 🔒 SECURITY: Use ONLY BACKEND_SHARED_SECRET - NO FALLBACK
    // This is a dedicated secret for backend-to-edge communication
    const backendSecret = Deno.env.get('BACKEND_SHARED_SECRET');

    if (!backendSecret) {
      logSecurity('ERROR', 'CRITICAL: BACKEND_SHARED_SECRET not configured', { requestId });
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 🔒 SECURITY: Constant-time comparison to prevent timing attacks
    if (!constantTimeEqual(token, backendSecret)) {
      logSecurity('WARN', 'Invalid authorization token', { requestId });
      recordFailedAuth(rateLimitKey); // Record failure for rate limiting
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Auth successful - no rate limit recording (legitimate backend)
    logSecurity('INFO', 'Authorization successful', { requestId });

    // Get secrets from environment (Supabase Vault)
    const secrets = {
      GOOGLE_CLIENT_ID: Deno.env.get('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      NOTION_CLIENT_ID: Deno.env.get('NOTION_CLIENT_ID'),
      NOTION_CLIENT_SECRET: Deno.env.get('NOTION_CLIENT_SECRET'),
      STRIPE_SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY'),
      STRIPE_WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      TOKEN_ENCRYPTION_KEY: Deno.env.get('TOKEN_ENCRYPTION_KEY'),
      STRIPE_PRICE_MONTHLY: Deno.env.get('STRIPE_PRICE_MONTHLY'),
      STRIPE_PRICE_ANNUAL: Deno.env.get('STRIPE_PRICE_ANNUAL'),
    };

    // Verify all secrets are present
    const missingSecrets = Object.entries(secrets)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingSecrets.length > 0) {
      logSecurity('ERROR', 'Missing secrets in vault', { requestId, missing: missingSecrets });
      return new Response(
        JSON.stringify({
          error: 'Missing secrets',
          missing: missingSecrets,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logSecurity('INFO', 'Secrets retrieved successfully', { requestId });

    return new Response(JSON.stringify(secrets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logSecurity('ERROR', 'Unexpected error', { requestId, error: String(error) });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
