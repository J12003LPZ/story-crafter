import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('api/generate handler', () => {
  let originalKey;
  beforeEach(() => {
    originalKey = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = 'test-key';
    vi.resetModules();
  });
  afterEach(() => {
    process.env.OPENROUTER_API_KEY = originalKey;
  });

  function mockReqRes(body, method = 'POST') {
    const req = { method, body };
    const res = {
      statusCode: 200,
      _json: null,
      status(code) { this.statusCode = code; return this; },
      json(obj) { this._json = obj; return this; },
    };
    return { req, res };
  }

  it('returns 405 on non-POST', async () => {
    vi.doMock('openai', () => ({ default: class { chat = { completions: { create: vi.fn() } }; } }));
    const handler = (await import('../../api/generate.js')).default;
    const { req, res } = mockReqRes(null, 'GET');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 400 when prompt is missing', async () => {
    vi.doMock('openai', () => ({ default: class { chat = { completions: { create: vi.fn() } }; } }));
    const handler = (await import('../../api/generate.js')).default;
    const { req, res } = mockReqRes({});
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._json.error).toMatch(/prompt/i);
  });

  it('calls OpenRouter and returns story text', async () => {
    const createMock = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'TITLE: Hi\n\nworld.' } }],
    });
    vi.doMock('openai', () => ({
      default: class { constructor() { this.chat = { completions: { create: createMock } }; } },
    }));
    const handler = (await import('../../api/generate.js')).default;
    const { req, res } = mockReqRes({ prompt: 'tell me a story' });
    await handler(req, res);

    expect(createMock).toHaveBeenCalledTimes(1);
    const args = createMock.mock.calls[0][0];
    expect(args.model).toBe('google/gemma-3-27b-it:free');
    expect(args.messages[0].role).toBe('system');
    expect(args.messages[1]).toEqual({ role: 'user', content: 'tell me a story' });
    expect(res.statusCode).toBe(200);
    expect(res._json.story).toBe('TITLE: Hi\n\nworld.');
  });

  it('returns 500 when OpenRouter throws', async () => {
    vi.doMock('openai', () => ({
      default: class { constructor() { this.chat = { completions: { create: vi.fn().mockRejectedValue(new Error('upstream boom')) } }; } },
    }));
    const handler = (await import('../../api/generate.js')).default;
    const { req, res } = mockReqRes({ prompt: 'x' });
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._json.error).toMatch(/upstream boom/);
  });
});
