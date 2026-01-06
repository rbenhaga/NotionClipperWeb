/**
 * Security Tests Suite (Integration Tests)
 * 
 * DoD: 0 input user → 500
 * All tests must pass for deployment
 * 
 * Run: pnpm test:integration (requires server running on localhost:3001)
 * Skip: pnpm test (unit tests only)
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Skip entire suite if RUN_INTEGRATION_TESTS is not set
const SKIP_INTEGRATION = !process.env.RUN_INTEGRATION_TESTS;
const describeIntegration = SKIP_INTEGRATION ? describe.skip : describe;
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

// 🔒 SECURITY: JWT_SECRET must be set in CI, fallback only for local dev
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.CI) {
  throw new Error('JWT_SECRET must be set in CI environment');
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || '4hP2yRdjWyeyLCCx0KMSJD2ID77PkKsja33sdZxi9p4=';

// Generate test tokens
const TEST_USER_A_ID = randomUUID();
// const TEST_USER_B_ID = randomUUID(); // For future IDOR tests

const TOKEN_USER_A = jwt.sign(
  { userId: TEST_USER_A_ID, email: 'userA@security.local' },
  EFFECTIVE_JWT_SECRET,
  { expiresIn: '1h' }
);

// Token for User B - kept for future IDOR tests
// const TOKEN_USER_B = jwt.sign(
//   { userId: TEST_USER_B_ID, email: 'userB@security.local' },
//   EFFECTIVE_JWT_SECRET,
//   { expiresIn: '1h' }
// );

const INVALID_UUID_TOKEN = jwt.sign(
  { userId: 'not-a-valid-uuid', email: 'test@security.local' },
  EFFECTIVE_JWT_SECRET,
  { expiresIn: '1h' }
);

// Aliases
const VALID_TOKEN = TOKEN_USER_A;
const AUTH_HEADERS = { Authorization: `Bearer ${VALID_TOKEN}` };
const INVALID_UUID_HEADERS = { Authorization: `Bearer ${INVALID_UUID_TOKEN}` };

// For future IDOR tests (User B trying to access User A's data)
// const AUTH_HEADERS_USER_B = { Authorization: `Bearer ${TOKEN_USER_B}` };

async function req(
  method: string,
  path: string,
  options: { headers?: Record<string, string>; body?: any } = {}
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { status: res.status, text, json };
}

describeIntegration('Security Tests', () => {
  beforeAll(async () => {
    // Verify server is running
    try {
      const health = await fetch(`${BASE_URL}/health`);
      if (!health.ok) {
        throw new Error('Server not healthy');
      }
    } catch {
      throw new Error(
        `Server not running at ${BASE_URL}. Start the server with: pnpm run dev`
      );
    }
  });

  describe('Auth Barrier (401)', () => {
    // 🔒 SECURITY: /api/notion/get-token REMOVED - tokens never sent to client
    // All Notion API calls now go through proxy endpoints

    it('POST /api/notion/proxy/search without auth → 401', async () => {
      const r = await req('POST', '/api/notion/proxy/search', {
        body: { query: 'test' },
      });
      expect(r.status).toBe(401);
    });

    it('POST /api/notion/save-connection without auth → 401', async () => {
      const r = await req('POST', '/api/notion/save-connection', {
        body: { workspaceId: 'ws', accessToken: 'tok' },
      });
      expect(r.status).toBe(401);
    });

    it('POST /api/usage/track without auth → 401', async () => {
      const r = await req('POST', '/api/usage/track', {
        body: { feature: 'clips', increment: 1 },
      });
      expect(r.status).toBe(401);
    });

    it('POST /api/usage/check-quota without auth → 401', async () => {
      const r = await req('POST', '/api/usage/check-quota', {
        body: { feature: 'clips' },
      });
      expect(r.status).toBe(401);
    });

    it('GET /api/user/profile without auth → 401', async () => {
      const r = await req('GET', '/api/user/profile');
      expect(r.status).toBe(401);
    });

    it('GET /api/activity/list without auth → 401', async () => {
      const r = await req('GET', '/api/activity/list');
      expect(r.status).toBe(401);
    });
  });

  describe('No 500 on Invalid Input', () => {
    it('POST /api/usage/track with invalid feature → 400 (not 500)', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: AUTH_HEADERS,
        body: { feature: 'hacked_feature', increment: 1 },
      });
      expect(r.status).toBe(400);
      expect(r.status).not.toBe(500);
    });

    it('POST /api/usage/track with invalid UUID → 400 (not 500)', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: INVALID_UUID_HEADERS,
        body: { feature: 'clips', increment: 1 },
      });
      expect(r.status).toBe(400);
      expect(r.status).not.toBe(500);
    });

    it('POST /api/usage/check-quota with invalid feature → 400 (not 500)', async () => {
      const r = await req('POST', '/api/usage/check-quota', {
        headers: AUTH_HEADERS,
        body: { feature: 'sql_injection' },
      });
      expect(r.status).toBe(400);
      expect(r.status).not.toBe(500);
    });

    it('GET /api/user/profile with valid token but no user → 404 (not 500)', async () => {
      const r = await req('GET', '/api/user/profile', {
        headers: AUTH_HEADERS,
      });
      expect(r.status).toBe(404);
      expect(r.status).not.toBe(500);
    });

    // 🔒 SECURITY: /api/notion/get-token REMOVED
    // Replaced with proxy endpoints that never expose tokens

    it('POST /api/notion/proxy/search with valid token but no workspace → 404 (not 500)', async () => {
      // User exists but has no Notion connection
      const r = await req('POST', '/api/notion/proxy/search', {
        headers: AUTH_HEADERS,
        body: { query: 'test' },
      });
      expect(r.status).toBe(404);
      expect(r.status).not.toBe(500);
    });

    it('POST /api/stripe/create-portal with no customer → 404 (not 500)', async () => {
      const r = await req('POST', '/api/stripe/create-portal', {
        headers: AUTH_HEADERS,
        body: { returnUrl: 'http://localhost:5173/dashboard' },
      });
      expect(r.status).toBe(404);
      expect(r.status).not.toBe(500);
    });
  });

  describe('SSRF Protection', () => {
    it('POST /api/stripe/create-portal with external URL → 400', async () => {
      const r = await req('POST', '/api/stripe/create-portal', {
        headers: AUTH_HEADERS,
        body: { returnUrl: 'https://evil.com/steal' },
      });
      expect(r.status).toBe(400);
    });

    it('POST /api/stripe/create-portal with internal IP → 400', async () => {
      const r = await req('POST', '/api/stripe/create-portal', {
        headers: AUTH_HEADERS,
        body: { returnUrl: 'http://127.0.0.1:8080/admin' },
      });
      expect(r.status).toBe(400);
    });

    it('POST /api/stripe/create-portal with AWS metadata → 400', async () => {
      const r = await req('POST', '/api/stripe/create-portal', {
        headers: AUTH_HEADERS,
        body: { returnUrl: 'http://169.254.169.254/latest/meta-data/' },
      });
      expect(r.status).toBe(400);
    });
  });

  describe('Input Validation', () => {
    it('POST /api/usage/track with increment=0 → 400', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: AUTH_HEADERS,
        body: { feature: 'clips', increment: 0 },
      });
      expect(r.status).toBe(400);
    });

    it('POST /api/usage/track with increment=101 → 400', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: AUTH_HEADERS,
        body: { feature: 'clips', increment: 101 },
      });
      expect(r.status).toBe(400);
    });

    it('POST /api/usage/track with increment=-5 → 400', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: AUTH_HEADERS,
        body: { feature: 'clips', increment: -5 },
      });
      expect(r.status).toBe(400);
    });

    it('POST /api/usage/track with float increment → 400', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: AUTH_HEADERS,
        body: { feature: 'clips', increment: 1.5 },
      });
      expect(r.status).toBe(400);
    });

    it('POST /api/usage/track with metadata > 10KB → 400', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: AUTH_HEADERS,
        body: {
          feature: 'clips',
          increment: 1,
          metadata: { data: 'x'.repeat(15000) },
        },
      });
      expect(r.status).toBe(400);
    });
  });

  describe('IDOR Protection', () => {
    // 🔒 SECURITY: /api/notion/get-token REMOVED - no token endpoints exist
    // Proxy endpoints use userId from JWT only, body.userId is ignored

    it('POST /api/notion/proxy/search ignores body.userId (uses token)', async () => {
      // Even if body contains a different userId, the endpoint should use the token's userId
      const r = await req('POST', '/api/notion/proxy/search', {
        headers: AUTH_HEADERS,
        body: { query: 'test', userId: 'different-user-id' },
      });
      // Should return 404 (user from token has no workspace), not data for 'different-user-id'
      expect(r.status).toBe(404);
    });
  });

  describe('Token Exposure Prevention', () => {
    it('No response should contain access_token or notionToken', async () => {
      // Test various endpoints that might leak tokens
      const endpoints = [
        { method: 'GET', path: '/api/user/app-data' },
        { method: 'GET', path: '/api/workspace/active' },
        { method: 'GET', path: '/api/user/notion-connection' },
      ];

      for (const { method, path } of endpoints) {
        const r = await req(method, path, { headers: AUTH_HEADERS });
        
        // Check response doesn't contain token fields
        if (r.json) {
          const jsonStr = JSON.stringify(r.json);
          expect(jsonStr).not.toContain('"token":');
          expect(jsonStr).not.toContain('"notionToken":');
          expect(jsonStr).not.toContain('"accessToken":');
          expect(jsonStr).not.toContain('"access_token":');
          expect(jsonStr).not.toContain('"decryptedToken":');
        }
      }
    });
  });

  describe('Public Endpoints', () => {
    it('GET /health → 200', async () => {
      const r = await req('GET', '/health');
      expect(r.status).toBe(200);
    });

    it('GET /api/health → 200', async () => {
      const r = await req('GET', '/api/health');
      expect(r.status).toBe(200);
    });

    it('GET /api/stripe/beta-spots → 200', async () => {
      const r = await req('GET', '/api/stripe/beta-spots');
      expect(r.status).toBe(200);
    });

    it('GET /api/waitlist/count → 200', async () => {
      const r = await req('GET', '/api/waitlist/count');
      expect(r.status).toBe(200);
    });
  });

  describe('Analytics Payload Size (DoS Protection)', () => {
    it('POST /api/analytics/content with 2MB payload → 413 or 400 (not 500)', async () => {
      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB
      const r = await req('POST', '/api/analytics/content', {
        headers: AUTH_HEADERS,
        body: { contentType: 'text', rawContent: largeContent },
      });
      expect([400, 413]).toContain(r.status);
      expect(r.status).not.toBe(500);
    });

    it('POST /api/analytics/analyze with 2MB payload → 413 or 400 (not 500)', async () => {
      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB
      const r = await req('POST', '/api/analytics/analyze', {
        headers: AUTH_HEADERS,
        body: { content: largeContent },
      });
      expect([400, 413]).toContain(r.status);
      expect(r.status).not.toBe(500);
    });
  });

  describe('Activity Export (DoS Protection)', () => {
    it('GET /api/activity/export with huge date range → not 500', async () => {
      const r = await req(
        'GET',
        '/api/activity/export?startDate=1900-01-01&endDate=2100-12-31',
        { headers: AUTH_HEADERS }
      );
      expect(r.status).not.toBe(500);
    });

    it('GET /api/activity/list with invalid dates → not 500', async () => {
      const r = await req(
        'GET',
        '/api/activity/list?startDate=invalid&endDate=also-invalid',
        { headers: AUTH_HEADERS }
      );
      expect(r.status).not.toBe(500);
    });
  });

  describe('Workspace IDOR Protection', () => {
    it('POST /api/workspace/set-default with random workspaceId → 404 (not 500)', async () => {
      const r = await req('POST', '/api/workspace/set-default', {
        headers: AUTH_HEADERS,
        body: { workspaceId: randomUUID() },
      });
      expect(r.status).toBe(404);
      expect(r.status).not.toBe(500);
    });

    it('POST /api/workspace/disconnect with random workspaceId → 404 (not 500)', async () => {
      const r = await req('POST', '/api/workspace/disconnect', {
        headers: AUTH_HEADERS,
        body: { workspaceId: randomUUID() },
      });
      expect(r.status).toBe(404);
      expect(r.status).not.toBe(500);
    });

    it('POST /api/workspace/check-availability with invalid UUID → 400 or 200 (not 500)', async () => {
      const r = await req('POST', '/api/workspace/check-availability', {
        headers: AUTH_HEADERS,
        body: { workspaceId: 'not-a-uuid' },
      });
      expect(r.status).not.toBe(500);
    });
  });

  describe('Analytics IDOR Protection', () => {
    it('POST /api/analytics/insights/:id/dismiss with random UUID → not 500', async () => {
      const r = await req(
        'POST',
        `/api/analytics/insights/${randomUUID()}/dismiss`,
        { headers: AUTH_HEADERS }
      );
      // Could be 404 (not found) or 200 (no-op), but never 500
      expect(r.status).not.toBe(500);
    });

    it('POST /api/analytics/insights/:id/read with random UUID → not 500', async () => {
      const r = await req(
        'POST',
        `/api/analytics/insights/${randomUUID()}/read`,
        { headers: AUTH_HEADERS }
      );
      expect(r.status).not.toBe(500);
    });

    it('POST /api/analytics/insights/:id/dismiss with invalid UUID → 400 (not 500)', async () => {
      const r = await req('POST', '/api/analytics/insights/not-a-uuid/dismiss', {
        headers: AUTH_HEADERS,
      });
      expect(r.status).toBe(400);
      expect(r.status).not.toBe(500);
    });
  });

  describe('Waitlist Enumeration Protection', () => {
    it('GET /api/waitlist/stats without email → 400 (not 500)', async () => {
      const r = await req('GET', '/api/waitlist/stats');
      expect(r.status).toBe(400);
      expect(r.status).not.toBe(500);
    });

    it('GET /api/waitlist/stats with non-existent email → 404 (not 500)', async () => {
      const r = await req(
        'GET',
        `/api/waitlist/stats?email=nonexistent-${Date.now()}@test.com`
      );
      expect(r.status).toBe(404);
      expect(r.status).not.toBe(500);
    });
  });

  describe('Generic No-500 on Invalid Input', () => {
    // Test all authenticated endpoints with empty body
    // 🔒 SECURITY: /api/notion/get-token REMOVED - replaced with proxy endpoints
    const authenticatedEndpoints = [
      { method: 'POST', path: '/api/usage/track' },
      { method: 'POST', path: '/api/usage/check-quota' },
      { method: 'POST', path: '/api/notion/proxy/search' },
      { method: 'POST', path: '/api/notion/save-connection' },
      { method: 'POST', path: '/api/stripe/create-portal' },
      { method: 'POST', path: '/api/stripe/create-checkout-session' },
      { method: 'POST', path: '/api/workspace/set-default' },
      { method: 'POST', path: '/api/workspace/disconnect' },
      { method: 'POST', path: '/api/workspace/check-availability' },
      { method: 'POST', path: '/api/analytics/content' },
      { method: 'POST', path: '/api/analytics/analyze' },
      { method: 'PATCH', path: '/api/user/profile' },
    ];

    authenticatedEndpoints.forEach(({ method, path }) => {
      it(`${method} ${path} with empty body → not 500`, async () => {
        const r = await req(method, path, {
          headers: AUTH_HEADERS,
          body: {},
        });
        expect(r.status).not.toBe(500);
      });

      it(`${method} ${path} with null values → not 500`, async () => {
        const r = await req(method, path, {
          headers: AUTH_HEADERS,
          body: { id: null, userId: null, feature: null },
        });
        expect(r.status).not.toBe(500);
      });
    });

    // Test public endpoints with invalid input
    const publicEndpoints = [
      { method: 'POST', path: '/api/waitlist/register' },
      { method: 'GET', path: '/api/waitlist/check/invalid-code' },
    ];

    publicEndpoints.forEach(({ method, path }) => {
      it(`${method} ${path} with invalid input → not 500`, async () => {
        const r = await req(method, path, {
          body: method === 'POST' ? {} : undefined,
        });
        expect(r.status).not.toBe(500);
      });
    });
  });

  describe('Error Code Standardization', () => {
    it('Missing auth → 401', async () => {
      const r = await req('GET', '/api/user/profile');
      expect(r.status).toBe(401);
    });

    it('Invalid token → 401', async () => {
      const r = await req('GET', '/api/user/profile', {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      expect(r.status).toBe(401);
    });

    it('Resource not found → 404', async () => {
      const r = await req('GET', '/api/user/profile', {
        headers: AUTH_HEADERS,
      });
      expect(r.status).toBe(404);
    });

    it('Validation error → 400', async () => {
      const r = await req('POST', '/api/usage/track', {
        headers: AUTH_HEADERS,
        body: { feature: 'invalid', increment: -1 },
      });
      expect(r.status).toBe(400);
    });
  });

  describe('Stripe Webhook Security', () => {
    it('POST /api/webhooks/stripe without signature → 400 (not 500)', async () => {
      const r = await req('POST', '/api/webhooks/stripe', {
        body: { type: 'checkout.session.completed', id: 'evt_test' },
      });
      expect(r.status).toBe(400);
      expect(r.status).not.toBe(500);
    });

    it('POST /api/webhooks/stripe with invalid signature → 400 (not 500)', async () => {
      const res = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid_signature_here',
        },
        body: JSON.stringify({ type: 'checkout.session.completed', id: 'evt_test' }),
      });
      expect(res.status).toBe(400);
      expect(res.status).not.toBe(500);
    });

    it('POST /api/webhooks/stripe with empty body → 400 (not 500)', async () => {
      const res = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 't=123,v1=abc',
        },
        body: '',
      });
      expect(res.status).toBe(400);
      expect(res.status).not.toBe(500);
    });
  });
});
