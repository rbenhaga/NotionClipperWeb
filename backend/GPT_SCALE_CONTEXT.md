# 📊 NotionClipper - Architecture & Scale Context for GPT

**Date:** 2025-12-19  
**Purpose:** Comprehensive context for GPT to create a scale plan  
**Status:** Security audit DONE, ready for scale optimization

---

## 1. CURRENT ARCHITECTURE OVERVIEW

### 1.1 Token Flow (OAuth → Proxy)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OAUTH FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Electron App                    Backend                      Notion        │
│  ───────────                    ───────                      ──────        │
│       │                            │                            │          │
│       │ 1. GET /api/auth/notion    │                            │          │
│       │    ?source=app             │                            │          │
│       │ ─────────────────────────► │                            │          │
│       │                            │                            │          │
│       │ 2. Redirect to Notion OAuth│                            │          │
│       │ ◄───────────────────────── │                            │          │
│       │                            │                            │          │
│       │ 3. User authorizes ────────┼───────────────────────────►│          │
│       │                            │                            │          │
│       │                            │ 4. Callback with code      │          │
│       │                            │ ◄──────────────────────────│          │
│       │                            │                            │          │
│       │                            │ 5. Exchange code for token │          │
│       │                            │ ─────────────────────────► │          │
│       │                            │                            │          │
│       │                            │ 6. access_token (ntn_...)  │          │
│       │                            │ ◄───────────────────────── │          │
│       │                            │                            │          │
│       │                            │ 7. ENCRYPT token (AES-256) │          │
│       │                            │    Store in DB             │          │
│       │                            │                            │          │
│       │ 8. Deep link with JWT      │                            │          │
│       │    notion-clipper://auth   │                            │          │
│       │    ?token=<JWT>            │                            │          │
│       │ ◄───────────────────────── │                            │          │
│       │                            │                            │          │
│  ✅ Client has JWT only            │                            │          │
│  ❌ Client NEVER gets Notion token │                            │          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Proxy Architecture (Token Never Leaves Server)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROXY FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Electron App                    Backend                      Notion API    │
│  ───────────                    ───────                      ──────────    │
│       │                            │                            │          │
│       │ POST /api/notion/proxy/search                           │          │
│       │ Headers: Authorization: Bearer <JWT>                    │          │
│       │ Body: { query: "meeting notes" }                        │          │
│       │ ─────────────────────────► │                            │          │
│       │                            │                            │          │
│       │                            │ 1. Validate JWT            │          │
│       │                            │ 2. Check rate limits       │          │
│       │                            │ 3. Get encrypted token     │          │
│       │                            │ 4. DECRYPT token           │          │
│       │                            │                            │          │
│       │                            │ POST /v1/search            │          │
│       │                            │ Authorization: Bearer ntn_ │          │
│       │                            │ ─────────────────────────► │          │
│       │                            │                            │          │
│       │                            │ ◄───────────────────────── │          │
│       │                            │                            │          │
│       │ { results: [...] }         │                            │          │
│       │ ◄───────────────────────── │                            │          │
│       │                            │                            │          │
│  ✅ Response contains DATA only    │                            │          │
│  ❌ Token NEVER in response        │                            │          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DATABASE SCHEMA

### 2.1 Core Tables

```sql
-- User profiles (linked to Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT CHECK (auth_provider IN ('google', 'notion', 'email')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notion OAuth connections (encrypted tokens)
CREATE TABLE notion_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  workspace_name TEXT,
  workspace_icon TEXT,
  access_token_encrypted TEXT NOT NULL,  -- AES-256-GCM encrypted
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

-- Anti-abuse: workspace history (one workspace = one account forever)
CREATE TABLE workspace_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT UNIQUE NOT NULL,
  workspace_name TEXT,
  first_user_id UUID REFERENCES user_profiles(id),
  first_user_email TEXT NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('FREE', 'PRO', 'TEAM')) DEFAULT 'FREE',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')) DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. PROXY ENDPOINTS (ALLOWLIST)

### 3.1 Available Endpoints

| Method | Endpoint | Purpose | Rate Limit |
|--------|----------|---------|------------|
| POST | `/api/notion/proxy/search` | Search pages/databases | 30/min |
| GET | `/api/notion/proxy/databases/:id` | Get database schema | 30/min |
| POST | `/api/notion/proxy/databases/:id/query` | Query database | 30/min |
| GET | `/api/notion/proxy/pages/:id` | Get page metadata | 30/min |
| POST | `/api/notion/proxy/pages` | Create page | 20/min |
| PATCH | `/api/notion/proxy/pages/:id` | Update page | 20/min |
| GET | `/api/notion/proxy/blocks/:id/children` | Get TOC/blocks | 30/min |
| PATCH | `/api/notion/proxy/blocks/:id/children` | Append blocks (clip) | 20/min |
| GET | `/api/notion/proxy/users/me` | Get bot user info | 10/min |

### 3.2 Rate Limiting (Current Implementation)

```typescript
// Layer 1: Global per-user (all endpoints combined)
const USER_GLOBAL_RATE_LIMIT_MAX = 120; // 120 total requests/min

// Layer 2: Per-user-per-endpoint
const USER_ENDPOINT_RATE_LIMITS = {
  '/search': 30,      // Read - higher
  '/databases': 30,
  '/pages': 30,
  '/blocks': 30,
  '/users/me': 10,    // Strict - rarely needed
  'POST:/pages': 20,  // Write - lower
  'PATCH:/pages': 20,
  'PATCH:/blocks': 20,
};

// Storage: In-memory Map (NOT distributed)
const userGlobalRateLimitMap = new Map<string, RateLimitEntry>();
const userEndpointRateLimitMap = new Map<string, RateLimitEntry>();
```

### 3.3 Security Layers

| Layer | Protection | Value |
|-------|------------|-------|
| Pagination cap | Prevents bulk extraction | max 100 items |
| Payload size | Prevents DoS | max 100KB |
| Response size | Prevents memory DoS | max 5MB |
| Timeout | Prevents slowloris | 30s |
| Audit logging | Detection | userId + workspaceId + latency |

---

## 4. API CALL AUDIT (Per Feature)

### 4.1 App Startup

| Action | API Calls | Detail |
|--------|-----------|--------|
| Load pages | 1-15 | `POST /search` (paginated, 100/page) |
| Load databases | 1-5 | `POST /search` (paginated) |
| **Total** | **3-20** | Depends on workspace size |

**Problem:** Loads ALL pages at startup, even if user only needs recent ones.

### 4.2 TOC (Table of Contents)

| Action | API Calls | Detail |
|--------|-----------|--------|
| Get page blocks | 1-5 | `GET /blocks/:id/children` (100/page) |
| **Total** | **1-5** | Depends on page length |

**Note:** Paginated if page has >100 blocks.

### 4.3 Multi-Page Selection (5 pages)

| Action | API Calls | Detail |
|--------|-----------|--------|
| TOC per page | 5-25 | 1-5 calls × 5 pages |
| **Total** | **5-25** | Linear with page count |

### 4.4 Simple Clip (End of Page)

| Action | API Calls | Detail |
|--------|-----------|--------|
| Append blocks | 1 | `PATCH /blocks/:id/children` |
| **Total** | **1** | Minimal |

### 4.5 Clip After Heading

| Action | API Calls | Detail |
|--------|-----------|--------|
| Get block info | 1 | `GET /blocks/:id` (to get parent) |
| Append after | 1 | `PATCH /blocks/:parent/children` with `after` param |
| **Total** | **2** | Fixed |

### 4.6 End of Section (Scan Required)

| Action | API Calls | Detail |
|--------|-----------|--------|
| Get all blocks | 1-5 | `GET /blocks/:id/children` (paginated) |
| Find section end | 0 | Client-side scan |
| Append after | 1 | `PATCH /blocks/:parent/children` |
| **Total** | **2-6** | Depends on page length |

**Problem:** Rescans entire page every time. No caching.

### 4.7 Multi-Page Clip (5 pages)

| Action | API Calls | Detail |
|--------|-----------|--------|
| Append per page | 5-10 | 1-2 calls × 5 pages |
| Rate limit delay | - | 350ms between calls |
| **Total** | **5-10** | ~2-4 seconds total |

```typescript
// From MultiPageInsertion.ts
export const RATE_LIMIT_DELAY_MS = 350; // Safety margin for Notion's 3 req/s
```

---

## 5. NOTION RATE LIMITS

### 5.1 Official Limits

| Limit | Value | Scope |
|-------|-------|-------|
| Requests per second | ~3 | **PER-TOKEN** (confirmed by test) |
| Burst | ~10 | Short bursts allowed |
| Page size | 100 max | Per request |

### 5.2 Rate Limit Test Results (2025-12-19)

**Test:** 2 different OAuth tokens, same integration, 4 rps for 12 minutes each.

| Scenario | 429s | First 429 at | Verdict |
|----------|------|--------------|---------|
| Solo A | 142 (5.0%) | 683s | Baseline |
| Solo B | 143 (5.0%) | 682s | Baseline |
| Concurrent A | 61 (2.2%) | 704s | ≤ Solo → PER-TOKEN |
| Concurrent B | 22 (0.8%) | 714s | ≤ Solo → PER-TOKEN |

**Conclusion:** Rate limit is **PER-TOKEN**, not per-integration. Each user has their own ~3 rps quota.

**Impact:**
- ✅ No global rate limiter needed
- ✅ SaaS can scale to 100+ users without shared bottleneck
- ✅ Per-user rate limiting + retry/backoff is sufficient

---

## 6. IDENTIFIED PROBLEMS

### 6.1 Startup Performance

| Problem | Impact | Solution |
|---------|--------|----------|
| Loads ALL pages at startup | 3-20 API calls, slow startup | Lazy load: recents first, then paginate |
| No caching | Reloads on every app open | Cache with `last_edited_time` invalidation |

### 6.2 TOC Performance

| Problem | Impact | Solution |
|---------|--------|----------|
| Rescans page for "end of section" | 2-6 API calls per clip | Cache TOC with `last_edited_time` |
| No anchor system | O(n) scan every time | Store anchor block IDs |

### 6.3 Rate Limiting

| Problem | Impact | Solution |
|---------|--------|----------|
| In-memory rate limiter | Lost on restart, not distributed | Redis-based rate limiter |
| Unknown Notion limit scope | May hit global limit | Test + double rate limiter |

### 6.4 Write Operations

| Problem | Impact | Solution |
|---------|--------|----------|
| No queue for writes | Concurrent clips may fail | BullMQ + Redis queue |
| No retry logic | Transient failures = lost clips | Exponential backoff |

---

## 7. SCALE IMPLEMENTATION STATUS

### 7.1 ✅ DONE: NotionClient Service (2025-12-19)

**File:** `backend/src/services/notion-client.service.ts`

**Features implemented:**
- Per-token rate limiting (token bucket: 2.5 rps sustained, 6 rps burst)
- Retry with exponential backoff + jitter (max 3 retries)
- Respects `Retry-After` header from Notion
- Circuit breaker (opens after 5 consecutive 429s, resets after 60s)
- 401 handling with `NOTION_TOKEN_INVALID` error code
- 30s timeout per request
- Structured logging for monitoring

```typescript
// Usage in controllers
const { client, workspaceId } = await getNotionClient(userId);
const response = await client.search(req.body);
// NotionClient handles rate limiting, retry, circuit breaker internally
```

### 7.2 ✅ DONE: Controller Refactoring

All proxy endpoints now use `NotionClient`:
- Simplified code (removed manual fetch + retry logic)
- Centralized rate limiting and error handling
- Application-layer rate limits increased (NotionClient handles Notion's limit)

### 7.3 TODO: Redis-Based Rate Limiting

```typescript
// Replace in-memory Maps with Redis
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(userId: string, endpoint: string): Promise<boolean> {
  const key = `ratelimit:${userId}:${endpoint}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  return count <= getEndpointLimit(endpoint);
}
```

### 7.4 Phase 4: Write Queue (BullMQ)

```typescript
// Queue for write operations
import { Queue, Worker } from 'bullmq';

const clipQueue = new Queue('clips', { connection: redis });

// Producer (API endpoint)
async function queueClip(userId: string, pageId: string, blocks: any[]) {
  await clipQueue.add('append-blocks', {
    userId,
    pageId,
    blocks,
    timestamp: Date.now(),
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}

// Consumer (Worker)
const worker = new Worker('clips', async (job) => {
  const { userId, pageId, blocks } = job.data;
  
  // Rate-limited call to Notion
  await notionGateway.appendBlocks(userId, pageId, blocks);
}, { connection: redis });
```

### 7.5 Phase 5: Product Optimizations

#### 5.1 Lazy Load Pages

```typescript
// Instead of loading all pages at startup
async function getInitialPages(): Promise<NotionPage[]> {
  // 1. Load recents first (fast, small)
  const recents = await getRecentPages({ limit: 20 });
  
  // 2. Load favorites (if any)
  const favorites = await getFavoritePages();
  
  // 3. Background: paginate rest
  loadRemainingPagesInBackground();
  
  return [...recents, ...favorites];
}
```

#### 5.2 Cache TOC with Invalidation

```typescript
interface CachedTOC {
  pageId: string;
  headings: HeadingBlock[];
  lastEditedTime: string; // From Notion page metadata
  cachedAt: number;
}

async function getTOC(pageId: string): Promise<HeadingBlock[]> {
  const cached = await cache.get(`toc:${pageId}`);
  
  if (cached) {
    // Check if page was edited since cache
    const page = await getPageMetadata(pageId); // 1 API call
    if (page.last_edited_time === cached.lastEditedTime) {
      return cached.headings; // Cache hit!
    }
  }
  
  // Cache miss: fetch full TOC
  const headings = await fetchTOC(pageId);
  await cache.set(`toc:${pageId}`, {
    pageId,
    headings,
    lastEditedTime: page.last_edited_time,
    cachedAt: Date.now(),
  });
  
  return headings;
}
```

#### 5.3 Anchor System for "End of Section"

```typescript
// Store anchor block IDs after first scan
interface SectionAnchor {
  headingBlockId: string;
  sectionEndBlockId: string; // Block ID where section ends
  lastEditedTime: string;
}

// On first "end of section" clip:
// 1. Scan page, find section end
// 2. Store anchor: { headingId, sectionEndId }
// 3. Next clip: use anchor directly (O(1) instead of O(n))
```

---

## 8. INFRASTRUCTURE REQUIREMENTS

### 8.1 Current (Single Server)

```
┌─────────────────────────────────────────┐
│           Current Architecture          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌─────────────┐    │
│  │   Backend   │    │  Supabase   │    │
│  │   (Node)    │───►│  (Postgres) │    │
│  │             │    │             │    │
│  │ In-memory   │    │ notion_     │    │
│  │ rate limits │    │ connections │    │
│  └─────────────┘    └─────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 8.2 Proposed (Distributed)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Proposed Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Backend 1  │    │  Backend 2  │    │  Backend N  │        │
│  │   (Node)    │    │   (Node)    │    │   (Node)    │        │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘        │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                   │
│                            ▼                                   │
│                    ┌─────────────┐                             │
│                    │    Redis    │                             │
│                    │             │                             │
│                    │ - Rate limits                             │
│                    │ - TOC cache                               │
│                    │ - BullMQ queues                           │
│                    └──────┬──────┘                             │
│                           │                                    │
│         ┌─────────────────┼─────────────────┐                  │
│         │                 │                 │                  │
│         ▼                 ▼                 ▼                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │  Supabase   │   │   BullMQ    │   │   Notion    │          │
│  │  (Postgres) │   │   Workers   │   │   Gateway   │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. PRIORITY ORDER

| Priority | Task | Effort | Impact | Status |
|----------|------|--------|--------|--------|
| 1 | Test Notion rate limit scope | 1 day | Critical for architecture | ✅ DONE |
| 2 | NotionClient with retry/backoff | 1 day | Reliability | ✅ DONE |
| 3 | Redis rate limiting | 2 days | Distributed, persistent | TODO |
| 4 | Lazy load pages | 2 days | Faster startup | TODO |
| 5 | TOC caching | 2 days | Fewer API calls | TODO |
| 6 | Write queue (BullMQ) | 3 days | Reliability | TODO |
| 7 | Anchor system | 2 days | O(1) section clips | TODO |

---

## 10. FILES TO REFERENCE

| File | Purpose |
|------|---------|
| `backend/src/services/notion-client.service.ts` | **NEW** NotionClient with retry/backoff/circuit breaker |
| `backend/src/controllers/notion.controller.ts` | Proxy endpoints (uses NotionClient) |
| `backend/src/controllers/auth.controller.ts` | OAuth flow |
| `backend/src/services/auth.service.ts` | Token handling |
| `backend/src/services/crypto.service.ts` | Token encryption (AES-256-GCM) |
| `backend/PROD_SECURITY_AUDIT.md` | Security status |
| `scripts/notion-rate-limit-test.mjs` | Rate limit test script |
| `notion-rate-limit-results-*.json` | Test results (PER-TOKEN confirmed) |

---

## 11. QUESTIONS FOR GPT

1. **Rate limit test script:** How to definitively test if Notion's 3 req/s is per-integration or per-token?

2. **Redis architecture:** Single Redis instance or Redis Cluster for rate limiting + caching + queues?

3. **TOC cache invalidation:** Best strategy for cache invalidation when page is edited externally?

4. **Queue priority:** Should clips have priority levels (e.g., single page > multi-page)?

5. **Fallback strategy:** If Redis is down, should we fall back to in-memory or reject requests?
