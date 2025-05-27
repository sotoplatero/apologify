/* empty css                                    */
import { c as createAstro, a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_Cb_NEMlC.mjs';
import { $ as $$Layout } from '../../chunks/Layout_Cn7SE8F0.mjs';
import { $ as $$LetterCard } from '../../chunks/LetterCard_CKEOB2H2.mjs';
import { g as getCollection } from '../../chunks/_astro_content_BDmLRPwN.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$Astro = createAstro("https://apologify.com");
async function getStaticPaths({ paginate }) {
  const allLetters = await getCollection("letters");
  allLetters.sort(
    (a, b) => a.id.localeCompare(b.id)
  );
  return paginate(allLetters, { pageSize: 12 });
}
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { page } = Astro2.props;
  function getSlugFromId(id) {
    const parts = id.split("/");
    return parts[parts.length - 1].replace(".json", "");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Apology Letter Examples", "description": "Browse our collection of apology letter examples" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<main class="container mx-auto px-6 py-12"> <!-- Header Section --> <div class="text-center space-y-4 mb-12"> <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">Apology Letter Examples</h1> <p class="text-xl text-gray-600">Browse our collection of professionally crafted apology letters</p> </div> <!-- Grid de Ejemplos --> <div id="examples-container"> ${page.data.length === 0 ? renderTemplate`<div class="text-center py-12"> <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> <p class="text-gray-600 text-lg">No example letters available yet. Check back soon!</p> </div>` : renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="examples-grid"> ${page.data.map((letter) => {
    const slug = getSlugFromId(letter.id);
    return renderTemplate`${renderComponent($$result2, "LetterCard", $$LetterCard, { "letter": letter, "slug": slug })}`;
  })} </div>`} </div> <!-- Mensaje cuando no hay resultados --> <div id="no-results" class="hidden text-center py-12"> <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> <h3 class="text-xl font-semibold text-gray-800 mb-2">No examples found</h3> <p class="text-gray-600">Try adjusting your filters or clear them to see all examples</p> </div> <!-- Paginación --> ${(page.url.prev || page.url.next) && renderTemplate`<nav class="mt-12 flex justify-center items-center gap-6"> ${page.url.prev ? renderTemplate`<a${addAttribute(page.url.prev, "href")} class="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-300 rounded-xl hover:border-purple-300 hover:text-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"> <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> <span>Previous</span> </a>` : renderTemplate`<span></span>`} <span class="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
Page ${page.currentPage} of ${page.lastPage} </span> ${page.url.next ? renderTemplate`<a${addAttribute(page.url.next, "href")} class="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-300 rounded-xl hover:border-purple-300 hover:text-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"> <span>Next</span> <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a>` : renderTemplate`<span></span>`} </nav>`} </main> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/examples/[...page].astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/examples/[...page].astro";
const $$url = "/examples/[...page]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
