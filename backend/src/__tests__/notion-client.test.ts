import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotionClient, clearRateLimitState } from '../services/notion-client.service.js';
import { AppError } from '../types/index.js';

describe('NotionClient reliability invariants', () => {
  beforeEach(() => {
    clearRateLimitState();
    vi.restoreAllMocks();
  });

  it('fast-fails and sets cooldown on long Retry-After responses', async () => {
    const client = new NotionClient({
      token: 'ntn_test_token',
      userId: 'user-123',
      workspaceId: 'workspace-123',
    });

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'rate limited' }), {
        status: 429,
        headers: { 'retry-after': '20' },
      })
    );

    vi.stubGlobal('fetch', mockFetch as any);

    await expect(client.search({})).rejects.toBeInstanceOf(AppError);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await expect(client.search({})).rejects.toBeInstanceOf(AppError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
