/* empty css                                 */
import { a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_Cb_NEMlC.mjs';
import { $ as $$Layout } from '../chunks/Layout_Cn7SE8F0.mjs';
import { g as getCollection } from '../chunks/_astro_content_BDkMadTn.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allLetters = await getCollection("letters");
  const recipientCounts = allLetters.reduce((acc, letter) => {
    const recipient = letter.data.recipient;
    acc[recipient] = (acc[recipient] || 0) + 1;
    return acc;
  }, {});
  const recipients = Object.entries(recipientCounts).sort(([a], [b]) => a.localeCompare(b));
  const recipientIcons = {
    boss: "\u{1F454}",
    client: "\u{1F91D}",
    colleague: "\u{1F465}",
    daughter: "\u{1F467}",
    father: "\u{1F468}",
    friend: "\u{1F46B}",
    husband: "\u{1F491}",
    mother: "\u{1F469}",
    romantic: "\u{1F495}",
    son: "\u{1F466}",
    teacher: "\u{1F4DA}",
    wife: "\u{1F491}"
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Apology Letter Examples", "description": "Choose the recipient for your apology letter" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-6 py-12"> <!-- Header Section --> <div class="text-center space-y-4 mb-16"> <h1 class="text-4xl md:text-6xl font-bold text-gray-800 leading-tight tracking-tight">
Apology Letter Examples
</h1> <p class="text-xl text-gray-600 max-w-2xl mx-auto">
Choose the recipient to find the perfect apology letter template for your situation
</p> </div> <!-- Recipients Cloud --> <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"> ${recipients.map(([recipient, count]) => renderTemplate`<a${addAttribute(`/examples/${recipient}`, "href")} class="group bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-xl text-center"> <!-- Icono --> <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300"> ${recipientIcons[recipient] || "\u{1F4DD}"} </div> <!-- Nombre del recipient --> <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors duration-300 capitalize"> ${recipient} </h3> <!-- Contador de cartas --> <p class="text-sm text-gray-500"> ${count} letter${count !== 1 ? "s" : ""} </p> <!-- Indicador visual --> <div class="mt-4 w-full h-1 bg-gray-200 rounded-full overflow-hidden"> <div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600"${addAttribute(`width: ${Math.min(count / Math.max(...Object.values(recipientCounts)) * 100, 100)}%`, "style")}></div> </div> </a>`)} </div> <!-- Stats Section --> <div class="mt-16 text-center"> <div class="inline-flex items-center space-x-8 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border-2 border-gray-200"> <div> <div class="text-2xl font-bold text-purple-600">${allLetters.length}</div> <div class="text-sm text-gray-600">Total Letters</div> </div> <div class="w-px h-8 bg-gray-300"></div> <div> <div class="text-2xl font-bold text-blue-600">${recipients.length}</div> <div class="text-sm text-gray-600">Recipients</div> </div> <div class="w-px h-8 bg-gray-300"></div> <div> <div class="text-2xl font-bold text-green-600">${[...new Set(allLetters.map((letter) => letter.data.tone))].length}</div> <div class="text-sm text-gray-600">Tones</div> </div> </div> </div> <!-- CTA Section --> <div class="mt-16 text-center"> <div class="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white"> <h2 class="text-2xl font-bold mb-4">Need a Custom Apology Letter?</h2> <p class="text-purple-100 mb-6">Use our AI-powered generator to create a personalized apology letter</p> <a href="/generator" class="inline-flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300"> <span>Generate Letter</span> <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> </svg> </a> </div> </div> </main> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/examples/index.astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/examples/index.astro";
const $$url = "/examples";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
