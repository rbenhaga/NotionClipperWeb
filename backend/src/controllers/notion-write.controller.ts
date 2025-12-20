import { Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError, AuthenticatedRequest } from '../types/index.js';
import { enqueueNotionWrite, getWriteJobResult, getWriteJobStatus } from '../services/notion-write.service.js';
import { sendSuccess } from '../utils/response.js';

function validateClipPayload(body: any): { targetId: string; blocks: Record<string, unknown>; insertionMode?: string; anchorId?: string } {
  if (!body || typeof body !== 'object') {
    throw new AppError('Invalid payload', 400);
  }
  const { targetId, blocks, insertionMode, anchorId } = body;
  if (!targetId || typeof targetId !== 'string') {
    throw new AppError('targetId is required', 400);
  }
  if (!blocks || typeof blocks !== 'object') {
    throw new AppError('blocks payload is required', 400);
  }

  return { targetId, blocks, insertionMode, anchorId };
}

export const queueClipWrite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const payload = validateClipPayload(req.body);

  const queued = await enqueueNotionWrite(userId, {
    operation: 'append_block_children',
    targetId: payload.targetId,
    payload: payload.blocks,
    insertionMode: payload.insertionMode,
    anchorId: payload.anchorId,
  });

  res.status(202);
  sendSuccess(res, {
    jobId: queued.jobId,
    status: queued.status,
    retryAt: queued.retryAt,
    result: queued.result,
  });
});

export const getClipJobStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const { jobId } = req.params;
  if (!jobId) {
    throw new AppError('jobId is required', 400);
  }

  const status = await getWriteJobStatus(jobId, userId);
  sendSuccess(res, status);
});

export const getClipJobResult = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const { jobId } = req.params;
  if (!jobId) {
    throw new AppError('jobId is required', 400);
  }

  const result = await getWriteJobResult(jobId, userId);
  sendSuccess(res, { result });
});
