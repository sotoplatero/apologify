/* empty css                                    */
import { c as createAstro, a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Cb_NEMlC.mjs';
import { $ as $$Layout } from '../../chunks/Layout_Cn7SE8F0.mjs';
import { g as getCollection } from '../../chunks/_astro_content_BDmLRPwN.mjs';
import { r as recipients } from '../../chunks/apologyData_SMoAwM42.mjs';
import { $ as $$LetterCard } from '../../chunks/LetterCard_CKEOB2H2.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$Astro = createAstro("https://apologify.com");
async function getStaticPaths() {
  return recipients.map((recipient) => ({
    params: { recipient: recipient.value },
    props: { recipientLabel: recipient.label }
  }));
}
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { recipient } = Astro2.params;
  const { recipientLabel } = Astro2.props;
  const recipientData = recipients.find((r) => r.value === recipient);
  const finalRecipientLabel = recipientLabel || recipientData?.label || "Unknown";
  const allLetters = await getCollection("letters", (entry) => entry.id.startsWith(`${recipient}/`));
  function getSlugFromId(id) {
    const parts = id.split("/");
    return parts[parts.length - 1].replace(".json", "");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Apology Letters for ${finalRecipientLabel}`, "description": `Example apology letters for ${finalRecipientLabel}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-6 py-12"> <!-- Header Section --> <div class="text-center space-y-4 mb-12"> <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">Apology Letters for ${finalRecipientLabel}</h1> <p class="text-xl text-gray-600">Browse apology letters specifically for ${finalRecipientLabel?.toLowerCase()}</p> </div> <!-- Grid de Ejemplos --> <div id="examples-container"> ${allLetters.length === 0 ? renderTemplate`<div class="text-center py-12"> <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> <p class="text-gray-600 text-lg">No apology letters found for this recipient.</p> </div>` : renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="examples-grid"> ${allLetters.map((letter) => {
    const slug = getSlugFromId(letter.id);
    return renderTemplate`${renderComponent($$result2, "LetterCard", $$LetterCard, { "letter": letter, "slug": slug })}`;
  })} </div>`} </div> <!-- Navegación --> <div class="mt-12 text-center"> <a href="/examples" class="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-300 rounded-xl hover:border-purple-300 hover:text-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"> <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> <span>Back to All Examples</span> </a> </div> </main> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/examples/[recipient]/index.astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/examples/[recipient]/index.astro";
const $$url = "/examples/[recipient]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
