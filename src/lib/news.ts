// Apology News, the weekly newsletter: one issue per folder,
// src/data/news/<YYYY>-w<NN>/issue.json (+ optional body.md for a longer
// editor's note), published at /news/<slug>. Issues are written by the n8n
// "Apology News: Draft" workflow and merged by hand (docs/newsletter/PLAN.md).
// Loaded with import.meta.glob like articles.ts; the schema check fails the
// build on a malformed issue so a broken PR never reaches production.
import { z } from 'astro/zod';
import slugifyLib from 'slugify';

const slugify = (s: string) => slugifyLib(s, { lower: true, strict: true }).slice(0, 80).replace(/-+$/, '');


const item = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  slot: z.enum(['best', 'worst', 'brief']),
  who: z.string().min(1),
  // An unknown category from the model shouldn't break the build: file it as "other".
  category: z.enum(['brand', 'celebrity', 'sports', 'politics', 'government', 'other']).catch('other'),
  country: z.string().optional(),
  headline: z.string().min(1),
  summary: z.string().min(1),
  quote: z.string().optional(),
  /** Our score, 0–5 in half points. */
  score: z.number().min(0).max(5).multipleOf(0.5),
  verdict: z.string().min(1),
  statementUrl: z.url().optional(),
  sourceUrl: z.url(),
  sourceName: z.string().min(1),
  statementDate: z.string().optional(),
  /** The news photo (og:image of the source article), shown with a credit link. */
  image: z.object({ src: z.url(), credit: z.string().min(1) }).optional(),
});

const issueSchema = z.object({
  week: z.string().regex(/^\d{4}-w\d{2}$/),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  intro: z.string().optional(),
  /** Cover image, served from /public (e.g. /news/<slug>.webp). */
  image: z.object({ src: z.string().startsWith('/'), alt: z.string().min(1) }).optional(),
  items: z.array(item).min(1),
});

export type NewsItem = z.infer<typeof item>;
export type NewsIssue = Omit<z.infer<typeof issueSchema>, 'slug'> & {
  slug: string;
  /** 1-based, oldest issue = 1. */
  number: number;
  /** Optional long-form note (body.md next to issue.json). */
  Content?: any;
};

const data = import.meta.glob('../data/news/*/issue.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const bodies = import.meta.glob('../data/news/*/body.md', { eager: true }) as Record<string, { Content: any }>;

const folderOf = (path: string) => path.split('/').slice(-2, -1)[0];

const parsed = Object.entries(data).map(([path, raw]) => {
  const result = issueSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid news issue ${path}: ${problems}`);
  }
  if (result.data.week !== folderOf(path)) {
    throw new Error(`News issue ${path}: "week" is ${result.data.week} but the folder is ${folderOf(path)}`);
  }
  const body = Object.entries(bodies).find(([p]) => folderOf(p) === result.data.week)?.[1];
  return { ...result.data, slug: result.data.slug || slugify(result.data.title), Content: body?.Content };
});

/** All issues, newest first. */
export const issues: NewsIssue[] = parsed
  .sort((a, b) => a.week.localeCompare(b.week))
  .map((issue, i) => ({ ...issue, number: i + 1 }))
  .reverse();

const dupe = issues.find((a, i) => issues.findIndex((b) => b.slug === a.slug) !== i);
if (dupe) throw new Error(`Two news issues share the slug "${dupe.slug}"`);

export const issueUrl = (issue: Pick<NewsIssue, 'slug'>) => `/news/${issue.slug}`;

export function getIssue(slug: string): NewsIssue | undefined {
  return issues.find((i) => i.slug === slug);
}

const SLOT_ORDER = { best: 0, worst: 1, brief: 2 } as const;
export const sortedItems = (issue: NewsIssue) =>
  [...issue.items].sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);

export const itemsBySlot = (issue: NewsIssue) => ({
  best: issue.items.find((i) => i.slot === 'best'),
  worst: issue.items.find((i) => i.slot === 'worst'),
  briefs: issue.items.filter((i) => i.slot === 'brief'),
});

/** Rough reading time of the rendered issue, in minutes. */
export function readingMinutes(issue: NewsIssue): number {
  const words = [issue.title, issue.intro ?? '', ...issue.items.flatMap((i) => [i.summary, i.verdict, i.quote ?? ''])]
    .join(' ')
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });

/** "Oct 26 – Nov 1, 2026": the seven days of news before the issue's date. */
export function coveredRange(issue: Pick<NewsIssue, 'date'>): string {
  const end = new Date(issue.date + 'T00:00:00Z');
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 6);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  return `${fmt(start, { month: 'short', day: 'numeric' })} – ${fmt(end, sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' })}, ${end.getUTCFullYear()}`;
}

export const publishedLabel = (date: string) =>
  fmt(new Date(date + 'T00:00:00Z'), { month: 'long', day: 'numeric', year: 'numeric' });

export const shortDate = (date: string) => fmt(new Date(date + 'T00:00:00Z'), { month: 'short', day: 'numeric' });

/** "3.5", "4": scores are shown without a trailing ".0". */
export const formatScore = (score: number) => (Number.isInteger(score) ? String(score) : score.toFixed(1));

/** Score colour, shared by the pages, the share image and (mirrored) the email. */
export function scoreColor(score: number): string {
  if (score >= 4) return '#2F6B3A';
  if (score >= 3) return '#5B7F2E';
  if (score >= 2) return '#8A6D12';
  if (score >= 1) return '#B5562B';
  return '#C1272D';
}
