import { Router } from 'express';
import { config } from '../config/index.js';

interface RequestMetric {
  endpoint: string;
  method: string;
  status: number;
  latencyMs: number;
  type: 'read' | 'write';
}

class InMemoryMetrics {
  private requests: RequestMetric[] = [];
  private retries: Record<string, number> = {};
  private retryAfters: number[] = [];
  private cooldownTokens = new Set<string>();
  private circuitOpenTokens = new Set<string>();
  private inFlight = 0;
  private queueDepths: Record<string, number> = {};
  private jobLatencies: { queue: string; latencyMs: number; status: 'succeeded' | 'failed' }[] = [];

  recordRequest(endpoint: string, method: string, status: number, latencyMs: number, type: 'read' | 'write'): void {
    this.requests.push({ endpoint, method, status, latencyMs, type });
    if (this.requests.length > 1000) {
      this.requests.shift();
    }
  }

  recordRetry(endpoint: string, status: number): void {
    const key = `${endpoint}:${status}`;
    this.retries[key] = (this.retries[key] || 0) + 1;
  }

  recordRetryAfter(retryAfterSec: number): void {
    if (retryAfterSec >= 0) {
      this.retryAfters.push(retryAfterSec);
      if (this.retryAfters.length > 500) {
        this.retryAfters.shift();
      }
    }
  }

  recordCooldown(tokenHash: string, active: boolean): void {
    if (active) {
      this.cooldownTokens.add(tokenHash);
    } else {
      this.cooldownTokens.delete(tokenHash);
    }
  }

  recordCircuit(tokenHash: string, active: boolean): void {
    if (active) {
      this.circuitOpenTokens.add(tokenHash);
    } else {
      this.circuitOpenTokens.delete(tokenHash);
    }
  }

  recordInFlight(count: number): void {
    this.inFlight = count;
  }

  recordQueueDepth(queue: string, depth: number): void {
    this.queueDepths[queue] = depth;
  }

  recordJobLatency(queue: string, latencyMs: number, status: 'succeeded' | 'failed'): void {
    this.jobLatencies.push({ queue, latencyMs, status });
    if (this.jobLatencies.length > 500) {
      this.jobLatencies.shift();
    }
  }

  snapshot(): Record<string, unknown> {
    const byEndpoint: Record<string, { total: number; statuses: Record<string, number>; p95: number }> = {};
    for (const req of this.requests) {
      const key = `${req.method}:${req.endpoint}:${req.type}`;
      const entry = byEndpoint[key] || { total: 0, statuses: {}, p95: 0 };
      entry.total += 1;
      entry.statuses[req.status] = (entry.statuses[req.status] || 0) + 1;
      byEndpoint[key] = entry;
    }

    return {
      notions: {
        byEndpoint,
        retryCounts: this.retries,
        retryAfterSamples: this.retryAfters.slice(-20),
        cooldownActiveCount: this.cooldownTokens.size,
        circuitOpenCount: this.circuitOpenTokens.size,
        inFlight: this.inFlight,
      },
      queue: {
        depths: this.queueDepths,
        jobLatencies: this.jobLatencies.slice(-20),
      },
    };
  }
}

export const notionMetrics = new InMemoryMetrics();

export function metricsRouter(): Router {
  const router = Router();

  router.get(config.observability.metricsRoute, (req, res) => {
    if (config.observability.metricsToken) {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer /i, '');
      if (!token || token !== config.observability.metricsToken) {
        res.status(401).json({ error: 'unauthorized' });
        return;
      }
    }

    if (!config.observability.enablePrometheus) {
      res.status(404).send('Metrics disabled');
      return;
    }

    return res.json({
      timestamp: new Date().toISOString(),
      metrics: notionMetrics.snapshot(),
    });
  });

  return router;
}
