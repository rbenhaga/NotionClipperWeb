# OBSERVABILITY — Notion Backend

## Metrics (JSON endpoint)
* Route: `/metrics` (enabled when `ENABLE_PROM_METRICS` ≠ `false`).
* Auth: provide `Authorization: Bearer <METRICS_TOKEN>` if `METRICS_TOKEN` is set (recommended in prod).
* Contents:
  - Recent Notion requests (endpoint/method/status/type/latency).
  - Retry counts per endpoint/status.
  - Retry-After samples (last N).
  - Cooldown active flag + in-flight request count.
  - Queue: depths by status, recent job latencies.

## Structured logs (Winston)
Key events:
* `NOTION_RATE_LIMITED`, `NOTION_RETRY_AFTER_TOO_LONG`
* `COOLDOWN_SET`, `COOLDOWN_ACTIVE`, `COOLDOWN_CLEARED`
* `NOTION_RETRY`, `NOTION_REQUEST_FAILED`
* `NOTION_WRITE_JOB_ERROR`
* `ALERT_RATE_LIMIT_SHIFT` (sentinel: multi-token 429 spike / Retry-After surge / time-to-first-429 drop)

Never log tokens or payloads. Token correlation uses SHA-256 hash suffix only.

## Dashboards / questions to answer
* Request volume by endpoint/status (use request samples).
* Latency distribution (p50/p95/p99 approximated from samples).
* 429 rate + Retry-After distribution.
* Queue depth and job latency (queued → done/failed).
* Sentinel alerts: detect rate limit behavior change (multi-token spikes).

## Alerts (log-derived)
* `ALERT_RATE_LIMIT_SHIFT` → investigate Notion behavior change.
* `NOTION_CIRCUIT_OPEN` → sustained 5xx/network issues.
* `SERVICE_DEGRADED` responses > threshold → verify upstream health/quotas.

## Safe handling
* No tokens in logs/responses.
* Retry-After > threshold → cooldown + fast-fail (no long sleep).
* Writes are async; status endpoints expose `status`, `retryAt`, `errorCode`, optional minimal `result`.
