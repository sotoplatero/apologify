import { c as createAstro, a as createComponent, m as maybeRenderHead, b as addAttribute, r as renderTemplate } from './astro/server_Cb_NEMlC.mjs';
/* empty css                          */

const $$Astro = createAstro("https://apologify.com");
const $$LetterCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$LetterCard;
  const { letter, slug } = Astro2.props;
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }
  return renderTemplate`${maybeRenderHead()}<article class="example-card group bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-xl"${addAttribute(letter.data.recipient, "data-recipient")}${addAttribute(letter.data.tone, "data-tone")} data-astro-cid-umhw6ixt> <a${addAttribute(`/examples/${letter.data.recipient}/${slug}`, "href")} class="block p-6 h-full flex flex-col" data-astro-cid-umhw6ixt> <!-- Título --> <h2 class="text-lg font-semibold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2" data-astro-cid-umhw6ixt> ${letter.data.context} </h2> <!-- Preview del contenido --> <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow" data-astro-cid-umhw6ixt> ${truncateText(letter.data.letters[0], 120)} </p> <!-- Footer con badges y flecha --> <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-200" data-astro-cid-umhw6ixt> <div class="flex items-center gap-2" data-astro-cid-umhw6ixt> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800" data-astro-cid-umhw6ixt> ${letter.data.recipient.charAt(0).toUpperCase() + letter.data.recipient.slice(1)} </span> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" data-astro-cid-umhw6ixt> ${letter.data.tone.charAt(0).toUpperCase() + letter.data.tone.slice(1)} </span> </div> <svg class="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-umhw6ixt> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-umhw6ixt></path> </svg> </div> </a> </article> `;
}, "C:/Users/pc02/projects/apologify.com/src/components/LetterCard.astro", void 0);

export { $$LetterCard as $ };
