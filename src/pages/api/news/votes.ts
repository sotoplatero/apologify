import type { APIRoute } from 'astro';
import { getIssue } from '../../../lib/news';
import { castVote, getIssueVotes } from '../../../lib/newsVotes';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });

// GET ?issue=<slug> → readers' averages per case (+ your own votes when signed in).
export const GET: APIRoute = async ({ url, locals }) => {
  const issue = getIssue(url.searchParams.get('issue') || '');
  if (!issue) return json({ error: 'Unknown issue' }, 404);
  const { tallies, mine } = await getIssueVotes(issue.slug, locals.user?.id ?? null);
  return json({ signedIn: Boolean(locals.user), tallies, mine });
};

// POST { issue, item, score } → records the signed-in reader's 0–5 score.
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Sign in to vote.' }, 401);
  const body = await request.json().catch(() => ({}));
  const issue = getIssue(String(body.issue || ''));
  const item = issue?.items.find((i) => i.id === body.item);
  const score = Number(body.score);
  if (!issue || !item) return json({ error: 'Unknown apology' }, 404);
  if (!Number.isInteger(score) || score < 0 || score > 5) return json({ error: 'Score must be a whole number from 0 to 5.' }, 400);
  const tally = await castVote(issue.slug, item.id, locals.user.id, score);
  return json({ tally, mine: score });
};
