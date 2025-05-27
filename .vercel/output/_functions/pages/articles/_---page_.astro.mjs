/* empty css                                    */
import { c as createAstro, a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_Cb_NEMlC.mjs';
import { g as getCollection } from '../../chunks/_astro_content_BDmLRPwN.mjs';
import { $ as $$UnsplashImage } from '../../chunks/UnsplashImage_B9wxJAFs.mjs';
import { $ as $$Layout } from '../../chunks/Layout_Cn7SE8F0.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$Astro = createAstro("https://apologify.com");
async function getStaticPaths({ paginate }) {
  try {
    const articles = await getCollection("articles");
    if (!articles || articles.length === 0) {
      console.warn("No articles found in collection");
      return [];
    }
    const validArticles = articles.filter((article) => {
      if (!article.data || !article.data.date) {
        console.warn(`Article ${article.slug} has no date`);
        return false;
      }
      return true;
    });
    const sortedArticles = validArticles.sort((a, b) => {
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateB.getTime() - dateA.getTime();
    });
    return paginate(sortedArticles, { pageSize: 10 });
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return [];
  }
}
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { page } = Astro2.props;
  if (!page) {
    throw new Error("Page prop is undefined. Check getStaticPaths function.");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Apology Articles", "description": "Browse our collection of apology articles" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="w-full max-w-screen-md mx-auto mt-16"> <h1 class="text-4xl font-bold mb-8 text-center">Apology Letter Articles</h1> <ul class="space-y-12"> ${page.data && page.data.length > 0 ? page.data.map((article) => renderTemplate`<li class="bg-white overflow-hidden"> <article class="prose prose-lg mx-auto"> ${article.data.image && renderTemplate`${renderComponent($$result2, "UnsplashImage", $$UnsplashImage, { "article": article })}`} ${article.data?.date && renderTemplate`<time${addAttribute(article.data.date?.toISOString(), "datetime")} class="text-sm text-gray-500"> ${article.data.date?.toLocaleDateString()} </time>`} <h2 class="mt-0 mb-2"> <a${addAttribute(`/articles/${article.slug}`, "href")} class="text-link"> ${article.data.title} </a> </h2> <p class="text-gray-600 mb-4">${article.data.description}</p> </article> </li>`) : renderTemplate`<li class="text-center text-gray-500"> <p>No articles found.</p> </li>`} </ul> <nav class="mt-8 flex justify-between"> ${page.url.prev ? renderTemplate`<a${addAttribute(page.url.prev, "href")} class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
&larr; Artículos anteriores
</a>` : renderTemplate`<span></span>`} ${page.url.next ? renderTemplate`<a${addAttribute(page.url.next, "href")} class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
Artículos siguientes &rarr;
</a>` : renderTemplate`<span></span>`} </nav> </main> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/articles/[...page].astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/articles/[...page].astro";
const $$url = "/articles/[...page]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
