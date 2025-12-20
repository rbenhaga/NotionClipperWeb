#!/usr/bin/env node
/**
 * NOTION RATE LIMIT TEST - RIGOROUS VERSION
 * 
 * This test will DEFINITIVELY determine if Notion's rate limit is:
 * - PER-TOKEN (each OAuth token has its own 2700 req/15min budget)
 * - PER-INTEGRATION (all tokens share a global 2700 req/15min budget)
 * 
 * Method:
 * 1. Token A solo @ 4 rps for 12 minutes (~2880 requests, exceeds 2700)
 * 2. Wait 16 minutes (reset budget)
 * 3. Token B solo @ 4 rps for 12 minutes (~2880 requests, exceeds 2700)
 * 4. Wait 16 minutes (reset budget)
 * 5. A + B concurrent @ 4 rps each for 12 minutes (total ~5760 requests)
 * 
 * Expected results:
 * - PER-TOKEN: Each token sees 429s around 11-12min in ALL tests (solo + concurrent)
 * - PER-INTEGRATION: Concurrent test sees MANY MORE 429s starting around 5-6min
 * 
 * Total duration: ~60 minutes (12min test + 16min wait) × 3 tests = 84 minutes
 * 
 * Usage:
 *   NOTION_TOKEN_A="ntn_..." NOTION_TOKEN_B="ntn_..." node notion-rate-limit-test-rigorous.mjs
 * 
 * Requirements:
 * - Node.js >= 18
 * - 2 different OAuth tokens from 2 different Notion accounts
 * - NO other Notion API traffic during test
 * - A test page ID in each workspace (for /blocks endpoint test)
 */

import { writeFileSync } from 'fs';

const NOTION_VERSION = process.env.NOTION_VERSION || "2022-06-28";
const TOKEN_A = process.env.NOTION_TOKEN_A;
const TOKEN_B = process.env.NOTION_TOKEN_B;

// Optional: provide test page IDs for blocks.children.list test
const TEST_PAGE_A = process.env.TEST_PAGE_A; // Page ID in workspace A
const TEST_PAGE_B = process.env.TEST_PAGE_B; // Page ID in workspace B

if (!TOKEN_A || !TOKEN_B) {
  console.error("❌ Missing NOTION_TOKEN_A or NOTION_TOKEN_B");
  console.error("");
  console.error("Usage:");
  console.error('  NOTION_TOKEN_A="ntn_..." NOTION_TOKEN_B="ntn_..." node notion-rate-limit-test-rigorous.mjs');
  console.error("");
  console.error("Optional (for blocks.children.list test):");
  console.error('  TEST_PAGE_A="page-id-1" TEST_PAGE_B="page-id-2"');
  process.exit(1);
}

if (!TOKEN_A.startsWith("ntn_") || !TOKEN_B.startsWith("ntn_")) {
  console.error("❌ Tokens must start with 'ntn_' (OAuth tokens)");
  process.exit(1);
}

if (TOKEN_A === TOKEN_B) {
  console.error("❌ TOKEN_A and TOKEN_B must be different");
  process.exit(1);
}

// ============================================================================
// HTTP HELPERS (with 30s timeout)
// ============================================================================

const REQUEST_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function callUsersMe(token) {
  const t0 = Date.now();
  try {
    const res = await fetchWithTimeout("https://api.notion.com/v1/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
      },
    });
    const ms = Date.now() - t0;
    const retryAfter = res.headers.get("retry-after");
    return { 
      status: res.status, 
      ms, 
      retryAfter: retryAfter ? Number(retryAfter) : null,
      timestamp: Date.now(),
    };
  } catch (err) {
    return { status: 0, ms: Date.now() - t0, retryAfter: null, timestamp: Date.now(), error: err.name };
  }
}

async function callSearch(token) {
  const t0 = Date.now();
  try {
    const res = await fetchWithTimeout("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 1 }),
    });
    const ms = Date.now() - t0;
    const retryAfter = res.headers.get("retry-after");
    return { 
      status: res.status, 
      ms, 
      retryAfter: retryAfter ? Number(retryAfter) : null,
      timestamp: Date.now(),
    };
  } catch (err) {
    return { status: 0, ms: Date.now() - t0, retryAfter: null, timestamp: Date.now(), error: err.name };
  }
}

async function callBlocksChildren(token, pageId) {
  if (!pageId) return callUsersMe(token); // Fallback
  
  const t0 = Date.now();
  try {
    const res = await fetchWithTimeout(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
      },
    });
    const ms = Date.now() - t0;
    const retryAfter = res.headers.get("retry-after");
    return { 
      status: res.status, 
      ms, 
      retryAfter: retryAfter ? Number(retryAfter) : null,
      timestamp: Date.now(),
    };
  } catch (err) {
    return { status: 0, ms: Date.now() - t0, retryAfter: null, timestamp: Date.now(), error: err.name };
  }
}

// ============================================================================
// LOAD TEST ENGINE
// ============================================================================

function sleep(ms) { 
  return new Promise(r => setTimeout(r, ms)); 
}

// Max concurrent requests to avoid changing test nature if network slows down
const MAX_IN_FLIGHT = 10;

async function runLoad(label, token, rps, durationMs, endpoint = "users_me", pageId = null) {
  const intervalMs = Math.floor(1000 / rps);
  const startTime = Date.now();
  const endAt = startTime + durationMs;

  const stats = { 
    label, 
    endpoint,
    rps, 
    startTime,
    total: 0, 
    ok: 0, 
    rl429: 0, 
    other: 0, 
    skipped: 0, // Requests skipped due to MAX_IN_FLIGHT
    ms: [], 
    retryAfter: [],
    timeline: [], // { elapsedSec, status, retryAfter }
  };
  
  let inFlight = 0;

  const callEndpoint = endpoint === "search" 
    ? () => callSearch(token)
    : endpoint === "blocks_children"
    ? () => callBlocksChildren(token, pageId)
    : () => callUsersMe(token);

  return new Promise((resolve) => {
    const timer = setInterval(async () => {
      if (Date.now() >= endAt) {
        clearInterval(timer);
        // Calculate actual duration and achieved RPS
        stats.actualDurationSec = Math.round((Date.now() - startTime) / 1000);
        stats.achievedRps = stats.total > 0 ? (stats.total / stats.actualDurationSec).toFixed(2) : 0;
        
        const drain = setInterval(() => {
          if (inFlight === 0) { 
            clearInterval(drain); 
            resolve(stats); 
          }
        }, 50);
        return;
      }

      // Skip if too many requests in flight (prevents test nature change)
      if (inFlight >= MAX_IN_FLIGHT) {
        stats.skipped++;
        return;
      }

      inFlight++;
      callEndpoint()
        .then(r => {
          const elapsedSec = Math.floor((r.timestamp - startTime) / 1000);
          
          stats.total++;
          stats.ms.push(r.ms);
          stats.timeline.push({ elapsedSec, status: r.status, retryAfter: r.retryAfter });
          
          if (r.status >= 200 && r.status < 300) {
            stats.ok++;
          } else if (r.status === 429) {
            stats.rl429++;
            if (r.retryAfter != null) stats.retryAfter.push(r.retryAfter);
          } else {
            stats.other++;
          }
        })
        .catch(() => { 
          stats.total++; 
          stats.other++;
        })
        .finally(() => { inFlight--; });
    }, intervalMs);
  });
}

// ============================================================================
// STATISTICS
// ============================================================================

function summarize(s) {
  const msSorted = [...s.ms].sort((a, b) => a - b);
  const p = (q) => msSorted.length ? msSorted[Math.floor(q * (msSorted.length - 1))] : null;
  const avg = msSorted.length ? Math.round(msSorted.reduce((a, b) => a + b, 0) / msSorted.length) : null;

  // Calculate when 429s started appearing (in seconds since start)
  const first429 = s.timeline.find(t => t.status === 429);
  const first429Time = first429 ? first429.elapsedSec : null;
  
  // Count 429s per minute bucket
  const buckets = {};
  s.timeline.forEach(t => {
    if (t.status === 429) {
      const bucket = Math.floor(t.elapsedSec / 60);
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
  });

  return {
    label: s.label,
    endpoint: s.endpoint,
    targetRps: s.rps,
    achievedRps: s.achievedRps || 0,
    actualDurationSec: s.actualDurationSec || 0,
    total: s.total,
    skipped: s.skipped || 0,
    ok: s.ok,
    rl429: s.rl429,
    rl429_pct: s.total > 0 ? ((s.rl429 / s.total) * 100).toFixed(1) + "%" : "0%",
    other: s.other,
    avgMs: avg,
    p50: p(0.50),
    p95: p(0.95),
    retryAfterSample: s.retryAfter.slice(0, 5),
    first429AtSec: first429Time,
    rl429PerMinute: buckets,
  };
}

function printSummary(s) {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│ ${s.label.padEnd(57)} │
├─────────────────────────────────────────────────────────────┤
│ Endpoint: ${s.endpoint.padEnd(48)} │
│ Target RPS: ${String(s.targetRps).padEnd(46)} │
│ Achieved RPS: ${String(s.achievedRps).padEnd(44)} │
│ Skipped (in-flight cap): ${String(s.skipped).padEnd(33)} │
│ Total requests: ${String(s.total).padEnd(42)} │
│ ✅ OK (2xx): ${String(s.ok).padEnd(46)} │
│ ⚠️  Rate limited (429): ${String(s.rl429).padEnd(35)} │
│ 429 percentage: ${s.rl429_pct.padEnd(42)} │
│ First 429 at: ${(s.first429AtSec !== null ? s.first429AtSec + "s" : "N/A").padEnd(44)} │
│ ❌ Other errors: ${String(s.other).padEnd(41)} │
│ Avg latency: ${(s.avgMs + "ms").padEnd(46)} │
│ P50 latency: ${(s.p50 + "ms").padEnd(46)} │
│ P95 latency: ${(s.p95 + "ms").padEnd(46)} │
│ Retry-After samples: ${JSON.stringify(s.retryAfterSample).substring(0, 37).padEnd(37)} │
├─────────────────────────────────────────────────────────────┤
│ 429s per minute:                                            │`);
  
  const minutes = Object.keys(s.rl429PerMinute).sort((a, b) => Number(a) - Number(b));
  minutes.forEach(min => {
    const count = s.rl429PerMinute[min];
    const bar = "█".repeat(Math.min(count / 10, 50));
    console.log(`│   Min ${String(min).padEnd(2)}: ${String(count).padEnd(4)} ${bar.padEnd(20)} │`);
  });
  
  console.log(`└─────────────────────────────────────────────────────────────┘`);
}

// ============================================================================
// MAIN TEST SEQUENCE
// ============================================================================

(async () => {
  const DURATION = 12 * 60 * 1000; // 12 minutes
  const PAUSE = 16 * 60 * 1000;    // 16 minutes (allows 15min budget reset + buffer)
  const INITIAL_COOLDOWN = 16 * 60 * 1000; // 16 min cooldown to reset any prior API usage
  const RPS = 4;                    // 4 rps - slightly above 3 rps limit, not too aggressive
  
  // Calculate actual total time: cooldown + 3 tests + 2 pauses
  const totalMinutes = Math.ceil((INITIAL_COOLDOWN + DURATION * 3 + PAUSE * 2) / 60000);
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          NOTION RATE LIMIT - RIGOROUS SCIENTIFIC TEST         ║
╠═══════════════════════════════════════════════════════════════╣
║ Total duration: ~${String(totalMinutes).padEnd(2)} minutes                                   ║
║ Target: Exceed 2700 req/15min to force 429s                  ║
║ Method: 3 tests @ ${RPS} rps × 12 min with 16 min pauses          ║
║                                                               ║
║ ⚠️  WARNING: DO NOT run other Notion API calls during test   ║
╚═══════════════════════════════════════════════════════════════╝
`);
  
  // Determine endpoint (prefer search if no test pages)
  const endpoint = TEST_PAGE_A && TEST_PAGE_B ? "blocks_children" : "search";
  
  console.log(`📊 Using endpoint: ${endpoint}`);
  if (endpoint === "blocks_children") {
    console.log(`   Test page A: ${TEST_PAGE_A}`);
    console.log(`   Test page B: ${TEST_PAGE_B}`);
  }
  console.log(``);
  
  // -------------------------------------------------------------------------
  // INITIAL COOLDOWN: Reset any prior API usage budget
  // -------------------------------------------------------------------------
  console.log(`⏳ INITIAL COOLDOWN: Waiting 16 minutes to reset any prior API usage...`);
  console.log(`   This ensures we start with a fresh rate limit budget.`);
  console.log(`   Test 1 starts at: ${new Date(Date.now() + INITIAL_COOLDOWN).toLocaleTimeString()}\n`);
  await sleep(INITIAL_COOLDOWN);
  
  // -------------------------------------------------------------------------
  // TEST 1: Token A solo
  // -------------------------------------------------------------------------
  console.log(`🔵 TEST 1/3: Token A SOLO @ ${RPS} rps for 12 minutes`);
  console.log(`Expected: ~${RPS * 12 * 60} requests (${RPS * 12 * 60 > 2700 ? 'exceeds 2700' : 'under 2700'})`);
  console.log(`Started at: ${new Date().toLocaleTimeString()}`);
  console.log(`Will end at: ${new Date(Date.now() + DURATION).toLocaleTimeString()}\n`);
  
  const aSolo = await runLoad("A_solo", TOKEN_A, RPS, DURATION, endpoint, TEST_PAGE_A);
  printSummary(summarize(aSolo));
  
  console.log(`\n⏳ Waiting 16 minutes before next test (budget reset)...`);
  console.log(`Next test starts at: ${new Date(Date.now() + PAUSE).toLocaleTimeString()}\n`);
  await sleep(PAUSE);
  
  // -------------------------------------------------------------------------
  // TEST 2: Token B solo
  // -------------------------------------------------------------------------
  console.log(`🟢 TEST 2/3: Token B SOLO @ ${RPS} rps for 12 minutes`);
  console.log(`Expected: ~${RPS * 12 * 60} requests (${RPS * 12 * 60 > 2700 ? 'exceeds 2700' : 'under 2700'})`);
  console.log(`Started at: ${new Date().toLocaleTimeString()}`);
  console.log(`Will end at: ${new Date(Date.now() + DURATION).toLocaleTimeString()}\n`);
  
  const bSolo = await runLoad("B_solo", TOKEN_B, RPS, DURATION, endpoint, TEST_PAGE_B);
  printSummary(summarize(bSolo));
  
  console.log(`\n⏳ Waiting 16 minutes before concurrent test (budget reset)...`);
  console.log(`Next test starts at: ${new Date(Date.now() + PAUSE).toLocaleTimeString()}\n`);
  await sleep(PAUSE);
  
  // -------------------------------------------------------------------------
  // TEST 3: Both tokens concurrent
  // -------------------------------------------------------------------------
  console.log(`🔴 TEST 3/3: A + B CONCURRENT @ ${RPS} rps each for 12 minutes`);
  console.log(`Expected: ~${RPS * 12 * 60 * 2} requests TOTAL (${RPS * 12 * 60 * 2 > 2700 ? 'GREATLY exceeds 2700' : 'under 2700'})`);
  console.log(`Started at: ${new Date().toLocaleTimeString()}`);
  console.log(`Will end at: ${new Date(Date.now() + DURATION).toLocaleTimeString()}\n`);
  
  const [aConcurrent, bConcurrent] = await Promise.all([
    runLoad("A_concurrent", TOKEN_A, RPS, DURATION, endpoint, TEST_PAGE_A),
    runLoad("B_concurrent", TOKEN_B, RPS, DURATION, endpoint, TEST_PAGE_B),
  ]);
  
  printSummary(summarize(aConcurrent));
  printSummary(summarize(bConcurrent));
  
  // -------------------------------------------------------------------------
  // ANALYSIS & VERDICT
  // -------------------------------------------------------------------------
  
  const aSoloSum = summarize(aSolo);
  const bSoloSum = summarize(bSolo);
  const aConcurrentSum = summarize(aConcurrent);
  const bConcurrentSum = summarize(bConcurrent);
  
  const solo429Total = aSoloSum.rl429 + bSoloSum.rl429;
  const concurrent429Total = aConcurrentSum.rl429 + bConcurrentSum.rl429;
  
  const solo429Start = [aSoloSum.first429AtSec, bSoloSum.first429AtSec].filter(x => x !== null);
  const concurrent429Start = [aConcurrentSum.first429AtSec, bConcurrentSum.first429AtSec].filter(x => x !== null);
  
  const avgSolo429Start = solo429Start.length > 0 
    ? Math.round(solo429Start.reduce((a, b) => a + b, 0) / solo429Start.length)
    : null;
  const avgConcurrent429Start = concurrent429Start.length > 0
    ? Math.round(concurrent429Start.reduce((a, b) => a + b, 0) / concurrent429Start.length)
    : null;
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     FINAL ANALYSIS                            ║
╠═══════════════════════════════════════════════════════════════╣`);
  
  console.log(`║ Solo tests:                                                   ║`);
  console.log(`║   Token A: ${String(aSoloSum.rl429).padEnd(4)} 429s (first at ${(aSoloSum.first429AtSec !== null ? aSoloSum.first429AtSec + "s" : "N/A").padEnd(6)})              ║`);
  console.log(`║   Token B: ${String(bSoloSum.rl429).padEnd(4)} 429s (first at ${(bSoloSum.first429AtSec !== null ? bSoloSum.first429AtSec + "s" : "N/A").padEnd(6)})              ║`);
  console.log(`║   Total solo 429s: ${String(solo429Total).padEnd(44)} ║`);
  console.log(`║                                                               ║`);
  console.log(`║ Concurrent test:                                              ║`);
  console.log(`║   Token A: ${String(aConcurrentSum.rl429).padEnd(4)} 429s (first at ${(aConcurrentSum.first429AtSec !== null ? aConcurrentSum.first429AtSec + "s" : "N/A").padEnd(6)})              ║`);
  console.log(`║   Token B: ${String(bConcurrentSum.rl429).padEnd(4)} 429s (first at ${(bConcurrentSum.first429AtSec !== null ? bConcurrentSum.first429AtSec + "s" : "N/A").padEnd(6)})              ║`);
  console.log(`║   Total concurrent 429s: ${String(concurrent429Total).padEnd(36)} ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════╣`);
  
  // Decision logic - now also uses first429 timing
  let verdict = "INCONCLUSIVE";
  let confidence = "UNKNOWN";
  let explanation = "";
  
  // Calculate timing difference (if concurrent 429s start much earlier, it's shared)
  // FIX: Use != null to handle first429AtSec === 0 correctly
  const timingDiff = (avgSolo429Start != null && avgConcurrent429Start != null)
    ? (avgSolo429Start - avgConcurrent429Start)
    : null;
  
  if (solo429Total === 0 && concurrent429Total === 0) {
    verdict = "INCONCLUSIVE";
    confidence = "❓";
    explanation = `No 429s observed in any test. Possible causes:
║ - RPS was too low (try 6-8 rps)
║ - Endpoint was too light (try /search or /blocks)
║ - Notion's burst tolerance is very high
║ 
║ RECOMMENDATION: Re-run with RPS=8 or longer duration (20min)`;
  } else if (concurrent429Total <= solo429Total * 1.3) {
    // Also check timing: if concurrent 429s start at similar time as solo, it's per-token
    if (timingDiff !== null && timingDiff > 180) {
      // Concurrent started 3+ min earlier despite similar count - suspicious
      verdict = "LIKELY PER-TOKEN (timing anomaly)";
      confidence = "🟡 MEDIUM";
      explanation = `Concurrent 429s ≈ Solo 429s (${concurrent429Total} vs ${solo429Total})
║ BUT concurrent 429s started ${timingDiff}s earlier than solo
║ → Mostly per-token but some shared component possible
║ 
║ RECOMMENDATION: Implement per-user rate limiting + monitor`;
    } else {
      verdict = "PER-TOKEN";
      confidence = "🟢 HIGH";
      explanation = `Concurrent 429s ≈ Solo 429s (${concurrent429Total} vs ${solo429Total})
║ First 429 timing: Solo avg ${avgSolo429Start || 'N/A'}s, Concurrent avg ${avgConcurrent429Start || 'N/A'}s
║ → Each OAuth token has its own rate limit budget
║ → Scaling with more users = more total capacity
║ 
║ BUSINESS IMPACT: ✅ Your SaaS can scale to 100+ users
║ RECOMMENDATION: Implement per-user rate limiting + retries`;
    }
  } else if (concurrent429Total > solo429Total * 3) {
    verdict = "PER-INTEGRATION (SHARED)";
    confidence = "🔴 HIGH";
    explanation = `Concurrent 429s >>> Solo 429s (${concurrent429Total} vs ${solo429Total})
║ First 429 timing: Solo avg ${avgSolo429Start || 'N/A'}s, Concurrent avg ${avgConcurrent429Start || 'N/A'}s
║ → All OAuth tokens share the same global rate limit
║ → Adding more users DOES NOT increase capacity
║ 
║ BUSINESS IMPACT: ❌ Your SaaS will NOT scale past ~50 users
║ RECOMMENDATION: Implement GLOBAL rate limiter (Redis) + queue`;
  } else if (timingDiff !== null && timingDiff > 240) {
    // Concurrent 429s started 4+ min earlier - strong signal of shared limit
    verdict = "LIKELY SHARED";
    confidence = "🟠 MEDIUM-HIGH";
    explanation = `Concurrent 429s started ${timingDiff}s earlier than solo tests
║ Count ratio: ${concurrent429Total} vs ${solo429Total} (${(concurrent429Total / solo429Total).toFixed(1)}x)
║ → Timing strongly suggests shared rate limit
║ 
║ BUSINESS IMPACT: ⚠️ Scaling may be limited
║ RECOMMENDATION: Implement GLOBAL rate limiter to be safe`;
  } else {
    verdict = "LIKELY PER-TOKEN";
    confidence = "🟡 MEDIUM";
    explanation = `Concurrent 429s > Solo 429s but not drastically (${concurrent429Total} vs ${solo429Total})
║ First 429 timing: Solo avg ${avgSolo429Start || 'N/A'}s, Concurrent avg ${avgConcurrent429Start || 'N/A'}s
║ → Pattern suggests per-token but with some shared bottleneck
║ → Could be network/server-side throttling
║ 
║ RECOMMENDATION: Implement per-user rate limiting + monitor prod`;
  }
  
  console.log(`║                                                               ║`);
  console.log(`║ 🎯 VERDICT: ${verdict.padEnd(49)} ║`);
  console.log(`║ Confidence: ${confidence.padEnd(49)} ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════╣`);
  console.log(`║ ${explanation.split('\n').join('\n║ ').padEnd(62)}║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);
  
  // Save raw data including full timeline for scientific analysis
  const results = {
    testConfig: {
      duration_minutes: 12,
      rps: RPS,
      pause_minutes: 16,
      initial_cooldown_minutes: 16,
      endpoint,
      timestamp: new Date().toISOString(),
    },
    summary: {
      aSolo: aSoloSum,
      bSolo: bSoloSum,
      aConcurrent: aConcurrentSum,
      bConcurrent: bConcurrentSum,
    },
    // Full timeline for deep analysis (can be large but useful)
    rawTimeline: {
      aSolo: aSolo.timeline,
      bSolo: bSolo.timeline,
      aConcurrent: aConcurrent.timeline,
      bConcurrent: bConcurrent.timeline,
    },
    verdict: {
      result: verdict,
      confidence,
      solo429Total,
      concurrent429Total,
      ratio: concurrent429Total / (solo429Total || 1),
      avgSolo429Start,
      avgConcurrent429Start,
      timingDiff,
    }
  };
  
  const filename = `notion-rate-limit-results-${Date.now()}.json`;
  writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Raw results saved to: ${filename}`);
  console.log(`   (includes full timeline for deep analysis)`);
  console.log(`\n✅ Test complete!\n`);
})();
