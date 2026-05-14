import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateStory } from '../../src/lib/openrouter.js';

describe('generateStory', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('POSTs the prompt to /api/generate and returns parsed story', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ story: 'TITLE: T\nSUBTITLE: S\n\nbody.' }),
    });

    const result = await generateStory('a tale of two cats');

    expect(global.fetch).toHaveBeenCalledWith('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a tale of two cats' }),
    });
    expect(result.title).toBe('T');
    expect(result.subtitle).toBe('S');
    expect(result.paragraphs).toEqual(['body.']);
  });

  it('throws when the server responds non-OK', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'upstream failed' }),
    });

    await expect(generateStory('x')).rejects.toThrow(/upstream failed/);
  });

  it('throws when prompt is empty', async () => {
    await expect(generateStory('')).rejects.toThrow(/empty/i);
    await expect(generateStory('   ')).rejects.toThrow(/empty/i);
  });
});
