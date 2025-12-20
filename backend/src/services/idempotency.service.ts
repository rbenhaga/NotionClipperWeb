import crypto from 'crypto';

export interface IdempotencyComponents {
  userId: string;
  workspaceId: string;
  targetId: string;
  insertionMode?: string;
  contentHash: string;
  operation: string;
  anchorId?: string;
}

export function hashContent(payload: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload || {})).digest('hex');
}

export function buildIdempotencyKey(components: IdempotencyComponents): string {
  const base = [
    components.userId,
    components.workspaceId,
    components.targetId,
    components.operation,
    components.insertionMode || 'append',
    components.anchorId || '',
    components.contentHash,
  ].join(':');

  return crypto.createHash('sha256').update(base).digest('hex');
}
