import { describe, it, expect } from 'vitest';
import { buildIdempotencyKey, hashContent } from '../services/idempotency.service.js';

describe('Idempotency key generation', () => {
  it('produces stable keys for identical payloads', () => {
    const hash = hashContent({ blocks: [{ text: 'hello' }] });
    const keyA = buildIdempotencyKey({
      userId: 'user-1',
      workspaceId: 'ws-1',
      targetId: 'block-1',
      insertionMode: 'append',
      contentHash: hash,
      operation: 'append_block_children',
    });
    const keyB = buildIdempotencyKey({
      userId: 'user-1',
      workspaceId: 'ws-1',
      targetId: 'block-1',
      insertionMode: 'append',
      contentHash: hash,
      operation: 'append_block_children',
    });

    expect(keyA).toBe(keyB);
  });

  it('changes when payload or target differs', () => {
    const hashA = hashContent({ blocks: [{ text: 'hello' }] });
    const hashB = hashContent({ blocks: [{ text: 'hello world' }] });

    const keyA = buildIdempotencyKey({
      userId: 'user-1',
      workspaceId: 'ws-1',
      targetId: 'block-1',
      insertionMode: 'append',
      contentHash: hashA,
      operation: 'append_block_children',
    });
    const keyB = buildIdempotencyKey({
      userId: 'user-1',
      workspaceId: 'ws-1',
      targetId: 'block-2',
      insertionMode: 'append',
      contentHash: hashB,
      operation: 'append_block_children',
    });

    expect(keyA).not.toBe(keyB);
  });
});
