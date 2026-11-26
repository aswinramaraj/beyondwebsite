/** Small pure helpers for the Insights pages, safe to use in both server and client components (lib/insights.ts reads files, so it is server-only). */

/** "Nov 24, 2026" (or "Nov 24" with short=true): fixed locale and time zone, so the server and the browser render the same text */
export function formatDate(iso: string, short = false) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(short ? {} : { year: 'numeric' }), timeZone: 'UTC' });
}

/** URL value for a topic: "Tech & society" → "tech-society" (used as /insights?topic=…) */
export const topicKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
