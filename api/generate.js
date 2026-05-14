import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a literary author who writes short, polished stories.

When given a user prompt, output a complete short story (roughly 600-1200 words) in this EXACT format:

TITLE: <a compelling title>
SUBTITLE: <one evocative sentence that hooks the reader>

<paragraph 1>

<paragraph 2>

...etc. Use blank lines between paragraphs. Do not use markdown headings, bullet points, or code fences. Output only the story.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server' });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Story Crafter',
    },
  });

  try {
    const completion = await client.chat.completions.create({
      model: 'google/gemma-3-27b-it:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const story = completion?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ story });
  } catch (err) {
    const message = err?.message || 'OpenRouter call failed';
    return res.status(500).json({ error: message });
  }
}
