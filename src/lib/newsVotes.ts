import { turso } from './turso';

// Readers' 0–5 scores for Apology News cases (table news_votes, see
// scripts/init-news-votes.js). One vote per signed-in user per case; voting
// again replaces the previous score.

export type VoteTally = { avg: number; count: number };

export async function getIssueVotes(
  issueSlug: string,
  userId: string | null,
): Promise<{ tallies: Record<string, VoteTally>; mine: Record<string, number> }> {
  const tallies: Record<string, VoteTally> = {};
  const mine: Record<string, number> = {};
  if (!turso) return { tallies, mine };
  const rows = await turso.execute({
    sql: 'SELECT item_id, AVG(score) AS avg, COUNT(*) AS n FROM news_votes WHERE issue_slug = ? GROUP BY item_id',
    args: [issueSlug],
  });
  for (const r of rows.rows) {
    tallies[String(r.item_id)] = { avg: Math.round(Number(r.avg) * 10) / 10, count: Number(r.n) };
  }
  if (userId) {
    const own = await turso.execute({
      sql: 'SELECT item_id, score FROM news_votes WHERE issue_slug = ? AND user_id = ?',
      args: [issueSlug, userId],
    });
    for (const r of own.rows) mine[String(r.item_id)] = Number(r.score);
  }
  return { tallies, mine };
}

export async function castVote(issueSlug: string, itemId: string, userId: string, score: number): Promise<VoteTally> {
  if (!turso) throw new Error('Database not configured');
  await turso.execute({
    sql: `INSERT INTO news_votes (issue_slug, item_id, user_id, score) VALUES (?, ?, ?, ?)
          ON CONFLICT (issue_slug, item_id, user_id) DO UPDATE SET score = excluded.score, updated_at = CURRENT_TIMESTAMP`,
    args: [issueSlug, itemId, userId, score],
  });
  const r = await turso.execute({
    sql: 'SELECT AVG(score) AS avg, COUNT(*) AS n FROM news_votes WHERE issue_slug = ? AND item_id = ?',
    args: [issueSlug, itemId],
  });
  return { avg: Math.round(Number(r.rows[0].avg) * 10) / 10, count: Number(r.rows[0].n) };
}
