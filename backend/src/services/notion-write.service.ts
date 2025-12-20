import { AppError } from '../types/index.js';
import { db } from '../config/database.js';
import { decryptToken } from './crypto.service.js';
import { createNotionClient } from './notion-client.service.js';
import { buildIdempotencyKey, hashContent } from './idempotency.service.js';
import { notionMetrics } from '../observability/metrics.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

interface ClipWritePayload {
  operation: 'append_block_children' | 'create_page' | 'update_page';
  targetId?: string;
  payload: Record<string, unknown>;
  insertionMode?: string;
  anchorId?: string;
}

interface JobStatusResponse {
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  retryAt?: string | null;
  errorCode?: string | null;
  result?: Record<string, unknown> | null;
}

function sanitizeResult(result: unknown): Record<string, unknown> | null {
  if (!result || typeof result !== 'object') return null;
  const data = result as Record<string, unknown>;
  const minimal: Record<string, unknown> = {};
  if (typeof data.id === 'string') minimal.id = data.id;
  if (typeof data.object === 'string') minimal.object = data.object;
  return Object.keys(minimal).length > 0 ? minimal : null;
}

function buildIdempotencyPayload(userId: string, workspaceId: string, payload: ClipWritePayload) {
  const contentHash = hashContent(payload.payload);
  const idempotencyKey = buildIdempotencyKey({
    userId,
    workspaceId,
    targetId: payload.targetId || payload.operation,
    insertionMode: payload.insertionMode || 'append',
    contentHash,
    operation: payload.operation,
    anchorId: payload.anchorId,
  });

  return { idempotencyKey, contentHash };
}

export async function enqueueNotionWrite(userId: string, payload: ClipWritePayload): Promise<{ jobId: string; status: string; retryAt?: string | null; result?: Record<string, unknown> | null }> {
  const connection = await db.getNotionConnection(userId);
  if (!connection) {
    throw new AppError('No Notion connection found', 404);
  }

  const { idempotencyKey, contentHash } = buildIdempotencyPayload(userId, connection.workspace_id, payload);
  // Insert idempotency first (or fetch existing)
  let idem = await db.getNotionIdempotency(idempotencyKey);
  if (!idem) {
    try {
      await db.insertNotionIdempotency({
        idempotencyKey,
        userId,
        workspaceId: connection.workspace_id,
        targetId: payload.targetId || payload.operation,
        insertionMode: payload.insertionMode || 'append',
        requestHash: contentHash,
        jobId: null,
        status: 'queued',
      });
    } catch (error: any) {
      // Unique violation -> someone else inserted; refetch
      idem = await db.getNotionIdempotency(idempotencyKey);
      if (!idem) {
        throw new AppError('Failed to create idempotency record', 500);
      }
    }
    idem = await db.getNotionIdempotency(idempotencyKey);
  }

  if (idem?.job_id) {
    return {
      jobId: idem.job_id,
      status: idem.status,
      retryAt: idem.retry_at,
      result: idem.result_metadata,
    };
  }

  // Insert job after idempotency exists (FK)
  let job;
  try {
    job = await db.insertNotionWriteJob({
      userId,
      workspaceId: connection.workspace_id,
      idempotencyKey,
      operation: payload.operation,
      targetId: payload.targetId || payload.operation,
      insertionMode: payload.insertionMode || 'append',
      payload: payload.payload,
      retryAt: null,
      maxAttempts: config.queue.notionWrites.maxAttempts,
    });
  } catch (error: any) {
    // Unique job/idempotency conflict: fetch existing job
    const existingJob = await db.getNotionWriteJobByIdempotency(idempotencyKey);
    if (existingJob) {
      return {
        jobId: existingJob.id,
        status: existingJob.status,
        retryAt: existingJob.retry_at,
        result: existingJob.result_metadata,
      };
    }
    throw error;
  }

  await db.updateNotionIdempotency(idempotencyKey, {
    job_id: job.id,
    status: 'queued',
  });

  const depth = await db.getQueueDepth();
  notionMetrics.recordQueueDepth('notion_write_jobs', depth.queued || 0);

  return { jobId: job.id, status: 'queued', retryAt: job.retry_at };
}

export async function getWriteJobStatus(jobId: string, userId: string): Promise<JobStatusResponse> {
  const job = await db.getNotionWriteJob(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  if (job.user_id !== userId) {
    throw new AppError('Job not found', 404);
  }

  return {
    status: job.status,
    retryAt: job.retry_at,
    errorCode: job.error_code,
    result: job.result_metadata,
  };
}

export async function getWriteJobResult(jobId: string, userId: string): Promise<Record<string, unknown> | null> {
  const job = await db.getNotionWriteJob(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  if (job.user_id !== userId) {
    throw new AppError('Job not found', 404);
  }

  return job.result_metadata || null;
}

async function processJob(job: any): Promise<void> {
  await db.updateNotionIdempotency(job.idempotency_key, { status: 'running' });

  try {
    const connection = await db.getNotionConnection(job.user_id);
    if (!connection) {
      await db.updateNotionWriteJob(job.id, { status: 'failed', error_code: 'NO_CONNECTION', completed_at: new Date().toISOString() });
      await db.updateNotionIdempotency(job.idempotency_key, { status: 'failed', error_code: 'NO_CONNECTION' });
      return;
    }

    const token = await decryptToken(connection.access_token_encrypted);
    const client = createNotionClient({
      token,
      userId: job.user_id,
      workspaceId: connection.workspace_id,
    });

    let response;
    if (job.operation === 'append_block_children') {
      if (!job.target_id) {
        throw new AppError('Missing targetId for append operation', 400);
      }
      response = await client.appendBlockChildren(job.target_id, job.payload);
    } else if (job.operation === 'create_page') {
      response = await client.createPage(job.payload);
    } else if (job.operation === 'update_page') {
      if (!job.target_id) {
        throw new AppError('Missing targetId for update operation', 400);
      }
      response = await client.updatePage(job.target_id, job.payload);
    } else {
      throw new AppError('Unsupported Notion write operation', 400);
    }
    const sanitized = sanitizeResult(response.data);

    await db.updateNotionWriteJob(job.id, {
      status: 'succeeded',
      completed_at: new Date().toISOString(),
      result_metadata: sanitized,
    });
    await db.updateNotionIdempotency(job.idempotency_key, {
      status: 'succeeded',
      result_metadata: sanitized,
      retry_at: null,
      error_code: null,
    });

    const depth = await db.getQueueDepth();
    notionMetrics.recordQueueDepth('notion_write_jobs', depth.queued || 0);
    notionMetrics.recordJobLatency('notion_write_jobs', new Date().getTime() - new Date(job.created_at).getTime(), 'succeeded');
  } catch (error) {
    const appErr = error as AppError & { retryAfter?: number; code?: string };
    const retryAfter = appErr.retryAfter;
    const shouldRetry = appErr.statusCode === 429 || appErr.statusCode === 503;

    const attemptsUsed = job.attempt_count ?? 0;
    const maxAttempts = job.max_attempts ?? config.queue.notionWrites.maxAttempts;

    const retryDelayMs = (() => {
      if (!shouldRetry) return null;
      if (retryAfter && retryAfter > 0) return retryAfter * 1000;
      const base = config.queue.notionWrites.backoffDelayMs * Math.pow(2, attemptsUsed);
      const jitter = Math.round(base * 0.3 * (Math.random() * 2 - 1));
      return Math.min(config.queue.notionWrites.maxBackoffMs, Math.max(500, base + jitter));
    })();

    const hasAttemptsLeft = shouldRetry && attemptsUsed < maxAttempts;
    const retryAt = hasAttemptsLeft && retryDelayMs ? new Date(Date.now() + retryDelayMs).toISOString() : null;
    const status: 'queued' | 'failed' = hasAttemptsLeft ? 'queued' : 'failed';
    const errorCode = appErr.code || (hasAttemptsLeft ? 'RETRY_LATER' : 'MAX_ATTEMPTS');

    await db.updateNotionWriteJob(job.id, {
      status,
      retry_at: retryAt,
      error_code: errorCode,
      completed_at: status === 'failed' ? new Date().toISOString() : null,
    });
    await db.updateNotionIdempotency(job.idempotency_key, {
      status,
      retry_at: retryAt,
      error_code: errorCode,
    });

    if (status === 'failed') {
      notionMetrics.recordJobLatency('notion_write_jobs', new Date().getTime() - new Date(job.created_at).getTime(), 'failed');
    }

    logger.warn({
      event: 'NOTION_WRITE_JOB_ERROR',
      jobId: job.id,
      status: status,
      error: appErr.message,
      code: appErr.code,
    });
  }
}

async function processBatch(): Promise<void> {
  const jobs = await db.getQueuedNotionWriteJobs(config.queue.notionWrites.concurrency);
  const runners = jobs.map((job) => processJob(job));
  await Promise.allSettled(runners);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let workerStarted = false;

export async function startNotionWriteWorker(): Promise<void> {
  if (workerStarted) return;
  workerStarted = true;

  if (config.env === 'test') {
    logger.info('[write-queue] Worker skipped in test environment');
    return;
  }

  logger.info('[write-queue] Starting Notion write worker (DB-backed)');

  const loop = async () => {
    // eslint-disable-next-line no-constant-condition
    while (workerStarted) {
      try {
        await processBatch();
      } catch (error) {
        logger.error('[write-queue] Worker error', error as Error);
      }
      await sleep(1000);
    }
  };

  void loop();
}
