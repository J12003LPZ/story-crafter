import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const FREE_DAILY_NEURONS = 10000;

// GraphQL query: total neurons consumed by this account today.
const QUERY = `
  query NeuronsToday($accountTag: String!, $start: Time!, $end: Time!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        aiInferenceAdaptiveGroups(
          limit: 1000
          filter: { datetimeHour_geq: $start, datetimeHour_leq: $end }
        ) {
          sum { neurons }
        }
      }
    }
  }
`;

function startOfUtcDayIso() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiKey || !accountId) {
    return res.status(200).json({ available: false, reason: 'not_configured' });
  }

  try {
    const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          accountTag: accountId,
          start: startOfUtcDayIso(),
          end: new Date().toISOString(),
        },
      }),
    });

    if (!cfRes.ok) {
      return res.status(200).json({ available: false, reason: `http_${cfRes.status}` });
    }

    const data = await cfRes.json();
    if (data.errors?.length) {
      return res.status(200).json({ available: false, reason: 'graphql_error', detail: data.errors[0]?.message });
    }

    const groups = data?.data?.viewer?.accounts?.[0]?.aiInferenceAdaptiveGroups || [];
    const used = groups.reduce((acc, g) => acc + (g?.sum?.neurons || 0), 0);
    const remaining = Math.max(0, FREE_DAILY_NEURONS - used);

    return res.status(200).json({
      available: true,
      used,
      remaining,
      dailyFree: FREE_DAILY_NEURONS,
    });
  } catch (err) {
    return res.status(200).json({ available: false, reason: err?.message || 'unknown' });
  }
}
