import { logger } from '../utils/logger.js';

const ALERT_WINDOW_MS = 60 * 1000;
const lastAlertAt: Record<string, number> = {};

interface RateLimitSignal {
  tokenHash: string;
  retryAfter?: number;
}

const recent429ByToken = new Map<string, number[]>();
const retryAfterSamples: number[] = [];

export function recordRateLimitSignal(signal: RateLimitSignal): void {
  const now = Date.now();
  const existing = recent429ByToken.get(signal.tokenHash) || [];
  existing.push(now);
  const pruned = existing.filter((ts) => now - ts <= ALERT_WINDOW_MS);
  recent429ByToken.set(signal.tokenHash, pruned);

  if (signal.retryAfter !== undefined) {
    retryAfterSamples.push(signal.retryAfter);
    if (retryAfterSamples.length > 100) {
      retryAfterSamples.shift();
    }
  }

  evaluateSentinel(now);
}

function evaluateSentinel(now: number): void {
  // Spike: many unique tokens hitting 429 in short window
  const tokensWith429 = Array.from(recent429ByToken.entries()).filter(([, timestamps]) =>
    timestamps.some((ts) => now - ts <= ALERT_WINDOW_MS)
  );

  const uniqueTokenCount = tokensWith429.length;

  const averageRetryAfter =
    retryAfterSamples.length > 0
      ? retryAfterSamples.reduce((a, b) => a + b, 0) / retryAfterSamples.length
      : 0;

  if (uniqueTokenCount >= 5 && shouldAlert('MULTI_TOKEN_SPIKE', now)) {
    logger.warn({
      event: 'ALERT_RATE_LIMIT_SHIFT',
      reason: 'MULTI_TOKEN_SPIKE',
      uniqueTokenCount,
      windowMs: ALERT_WINDOW_MS,
    });
  }

  if (averageRetryAfter > 30 && shouldAlert('RETRY_AFTER_SURGE', now)) {
    logger.warn({
      event: 'ALERT_RATE_LIMIT_SHIFT',
      reason: 'RETRY_AFTER_SURGE',
      averageRetryAfter,
    });
  }

}

function shouldAlert(reason: string, now: number): boolean {
  const last = lastAlertAt[reason] || 0;
  if (now - last < ALERT_WINDOW_MS) {
    return false;
  }
  lastAlertAt[reason] = now;
  return true;
}
