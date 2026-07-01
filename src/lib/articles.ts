// Articles are local static markdown. We load them with Vite's import.meta.glob
// (statically analyzed + bundled) instead of the content layer, which keeps them
// working identically in dev, build and on-demand/serverless rendering.

export interface ArticleData {
  title: string;
  description: string;
  date: string | Date;
  tags?: string[];
  image?: string;
  photographer?: string;
  photographerUrl?: string;
}

export interface Article {
  slug: string;
  data: ArticleData;
  Content: any;
}

const modules = import.meta.glob('../data/articles/*/index.md', { eager: true }) as Record<
  string,
  { frontmatter: ArticleData; Content: any }
>;

/** All articles, newest first. */
export const articles: Article[] = Object.entries(modules)
  .map(([path, mod]) => ({
    slug: (path.match(/\/articles\/([^/]+)\/index\.md$/) || [, path])[1] as string,
    data: mod.frontmatter,
    Content: mod.Content,
  }))
  .sort(
    (a, b) => new Date(b.data.date || 0).getTime() - new Date(a.data.date || 0).getTime(),
  );

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
