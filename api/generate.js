import { config } from "dotenv";
import { resolve } from "path";
import OpenAI from "openai";

config({ path: resolve(process.cwd(), ".env.local") });

const SYSTEM_PROMPT = `You are a literary author who writes short, polished stories.

When given a user prompt, output a complete short story (roughly 600-1200 words) in this EXACT format:

TITLE: <a compelling title>
SUBTITLE: <one evocative sentence that hooks the reader>

<paragraph 1>

<paragraph 2>

...etc. Use blank lines between paragraphs. Do not use markdown headings, bullet points, or code fences. Output only the story.`;

function buildClient() {
  const provider = (process.env.AI_PROVIDER || 'openrouter').toLowerCase();

  if (provider === 'cloudflare') {
    const apiKey = process.env.CLOUDFLARE_API_KEY;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!apiKey) throw new Error('CLOUDFLARE_API_KEY is not configured');
    if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is not configured');
    const model = process.env.CLOUDFLARE_MODEL || '@cf/meta/llama-3.1-8b-instruct';
    // Use fetch directly — the OpenAI SDK adds OpenAI-specific headers Cloudflare rejects
    return { provider: 'cloudflare', apiKey, accountId, model };
  }

  // Default: OpenRouter
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');
  return {
    provider: 'openrouter',
    client: new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Story Crafter',
      },
    }),
    model: process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  let cfg;
  try {
    cfg = buildClient();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  try {
    let story = '';

    const ac = new AbortController();
    const upstreamTimeout = setTimeout(() => ac.abort(), 240_000); // 4 min

    try {
      if (cfg.provider === 'cloudflare') {
        const url = `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}/ai/run/${cfg.model}`;
        const cfRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1800,
          }),
          signal: ac.signal,
        });
        if (!cfRes.ok) {
          const text = await cfRes.text().catch(() => '');
          throw new Error(`Cloudflare ${cfRes.status}: ${text || 'no body'}`);
        }
        const data = await cfRes.json();
        console.log('[cloudflare] raw response:', JSON.stringify(data).slice(0, 500));
        story = data?.result?.response
          || data?.result?.choices?.[0]?.message?.content
          || data?.result?.content
          || '';
      } else {
        const completion = await cfg.client.chat.completions.create(
          {
            model: cfg.model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            temperature: 0.9,
            max_tokens: 1800,
          },
          { signal: ac.signal }
        );
        story = completion?.choices?.[0]?.message?.content || '';
      }
    } finally {
      clearTimeout(upstreamTimeout);
    }

    return res.status(200).json({ story });
  } catch (err) {
    const message = err?.message || 'AI provider call failed';
    return res.status(500).json({ error: message });
  }
}
