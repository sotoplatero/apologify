/* empty css                                    */
import { c as createAstro, a as createComponent, m as maybeRenderHead, r as renderTemplate, d as renderComponent, b as addAttribute } from '../../chunks/astro/server_Cb_NEMlC.mjs';
import { g as getCollection } from '../../chunks/_astro_content_BDmLRPwN.mjs';
import { $ as $$Layout } from '../../chunks/Layout_Cn7SE8F0.mjs';
import { $ as $$UnsplashImage } from '../../chunks/UnsplashImage_B9wxJAFs.mjs';
import { $ as $$CallToAction } from '../../chunks/CallToAction_B5EKILy2.mjs';
/* empty css                                     */
export { r as renderers } from '../../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$Astro$1 = createAstro("https://apologify.com");
const $$CtaMini = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CtaMini;
  const {
    title = "Need to Apologize?",
    description = "Generate a clear, custom apology letter in 2 minutes \u2014 no account needed."
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="not-prose bg-gray-50 border border-gray-200 rounded-md px-5 py-4 my-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"> <div> <h2 class="text-base font-bold text-gray-900 mb-1">${title}</h2> <p class="text-sm text-gray-600">${description}</p> </div> <a href="/generator" class="btn btn-outline btn-sm whitespace-nowrap">
Write Now →
</a> </div>`;
}, "C:/Users/pc02/projects/apologify.com/src/components/CtaMini.astro", void 0);

const $$Astro = createAstro("https://apologify.com");
async function getStaticPaths() {
  const articleEntries = await getCollection("articles");
  return articleEntries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { entry } = Astro2.props;
  const { Content } = await entry.render();
  const articles = await getCollection("articles");
  const sortedArticles = articles.sort(
    (a, b) => new Date(b.data.date || 0).getTime() - new Date(a.data.date || 0).getTime()
  );
  const currentIndex = sortedArticles.findIndex((article) => article.slug === entry.slug);
  const prevArticle = sortedArticles[currentIndex + 1];
  const nextArticle = sortedArticles[currentIndex - 1];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": entry.data.title,
    "description": entry.data.description,
    "image": entry.data.image,
    "datePublished": entry.data.date?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
    "dateModified": entry.data.date?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Apologify"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Apologify",
      "logo": {
        "@type": "ImageObject",
        "url": "https://apologify.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://apologify.com/articles/${entry.slug}`
    }
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": entry.data.title, "description": entry.data.description, "schema": schema }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="prose prose-xl mx-auto mt-16"> ${entry.data.date && renderTemplate`<time${addAttribute(entry.data?.date.toISOString(), "datetime")} class="text-gray-500"> ${entry.data.date.toLocaleDateString()} </time>`} <h1>${entry.data.title}</h1> ${renderComponent($$result2, "UnsplashImage", $$UnsplashImage, { "article": entry })} ${renderComponent($$result2, "CtaMini", $$CtaMini, {})} ${renderComponent($$result2, "Content", Content, {})} </article>  <div class="flex justify-between my-8"> ${prevArticle && renderTemplate`<a${addAttribute(`/articles/${prevArticle.slug}`, "href")} class="text-blue-500 hover:underline">
← ${prevArticle.data.title} </a>`} ${nextArticle && renderTemplate`<a${addAttribute(`/articles/${nextArticle.slug}`, "href")} class="text-blue-500 hover:underline ml-auto"> ${nextArticle.data.title} →
</a>`} </div> ${renderComponent($$result2, "CallToAction", $$CallToAction, {})} ` })} `;
}, "C:/Users/pc02/projects/apologify.com/src/pages/articles/[slug].astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/articles/[slug].astro";
const $$url = "/articles/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
