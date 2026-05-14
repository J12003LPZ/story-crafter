# Story Crafter

Generate short stories with Google Gemma 3 (via OpenRouter) and download them as
self-contained HTML storybooks with built-in voice narration.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your OpenRouter key:
   - Get a free key at https://openrouter.ai/keys
3. Run the API in one terminal: `npx vercel dev --listen 3001`
4. Run the app in another: `npm run dev`
5. Open http://localhost:5173.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm test` — run Vitest
- `npx vercel dev` — local serverless runtime for `/api/*`

## How it works

- React + Tailwind front-end with three routes (`/`, `/weaving`, `/result`).
- `/api/generate` is a Vercel serverless function that calls OpenRouter's
  OpenAI-compatible endpoint with model `google/gemma-3-27b-it:free`.
- The generated story is rendered in-app and can be exported as a single
  self-contained HTML file that uses the browser's `speechSynthesis` API
  for narration.

## Deploying

Push to GitHub, import the repo in Vercel, set `OPENROUTER_API_KEY` as a
project environment variable. Vercel will pick up `api/generate.js` and
`vercel.json` automatically.
