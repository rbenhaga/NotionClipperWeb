# RUNBOOK — Notion Reliability Incidents

## Scope
Backend-only (no Electron/app changes). Applies to `/api/notion/*` proxy + `/api/notion/write/*` queue.

## 1. Notion 429 storm / Retry-After long
1) Confirm metrics/logs  
   - Look for `NOTION_RATE_LIMITED` / `NOTION_RETRY_AFTER_TOO_LONG` events.  
   - Check cooldown map via logs (`COOLDOWN_SET`, `COOLDOWN_ACTIVE`).  
2) User-facing response  
   - API should return `429 NOTION_COOLDOWN` (read) or `202` (write queued).  
3) Actions  
   - Keep cooldowns; **never** sleep in request handlers.  
   - If surge persists, toggle `NOTION_DEGRADED_MODE=true` (blocks writes, limits reads).  
4) Recovery  
   - Cooldown auto-clears on success.  
   - Verify queue drains (see queue depth below).

## 2. Notion down / 5xx storms
1) Symptoms: repeated `5xx` from Notion, circuit opens (`NOTION_CIRCUIT_OPEN`).  
2) Actions  
   - Circuit breaker already fast-fails.  
   - Enable `NOTION_DEGRADED_MODE=true` to protect frontend.  
3) Recovery: wait for Notion to stabilize; circuit half-open will test and close automatically.

## 3. Redis unavailable (N/A here) / DB-backed queue issues
* Queue is **Postgres-backed** (tables `notion_write_jobs`, `notion_idempotency`).  
* If Supabase/Postgres degraded: writes will enqueue but may fail to persist → respond 503.  
* Check logs for `Database error inserting notion write job`.  
* Once DB recovered: worker will resume scanning `status=queued` jobs.

## 4. Queue stuck / not progressing
1) Inspect `notion_write_jobs`  
   - `status=queued` with old `created_at` → worker not running.  
   - `retry_at` in future → waiting for cooldown.  
2) Actions  
   - Ensure backend process is up (worker starts with server).  
   - Check logs for `NOTION_WRITE_JOB_ERROR`.  
   - If jobs are bad (invalid payload), set `status=failed`, set `error_code`, and update idempotency to `failed`.

## 5. Token invalid
* Worker marks job failed with `NOTION_TOKEN_INVALID`.  
* App should prompt reconnection; no retry until token refreshed.

## 6. Safety invariants
* **Never** log or return Notion tokens.  
* Backpressure: `SERVER_BUSY` if in-flight exceeds cap.  
* Cooldown threshold: Retry-After > `NOTION_COOLDOWN_MIN_SECONDS` ⇒ fast-fail, no sleeps > few seconds.

## 7. Commands / checks
* Queue depth (DB): inspect `notion_write_jobs` counts by status.  
* Metrics endpoint (JSON): `GET /metrics` (if enabled) → contains request samples, queue depths.  
* Toggle degraded mode: set env `NOTION_DEGRADED_MODE=true` and restart.
