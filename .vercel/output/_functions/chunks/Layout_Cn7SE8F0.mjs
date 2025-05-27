import { c as createAstro, a as createComponent, b as addAttribute, g as renderScript, r as renderTemplate, e as renderSlot, h as renderHead, d as renderComponent, u as unescapeHTML, m as maybeRenderHead } from './astro/server_Cb_NEMlC.mjs';
/* empty css                         */

const $$Astro$2 = createAstro("https://apologify.com");
const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "C:/Users/pc02/projects/apologify.com/node_modules/.pnpm/astro@5.8.0_@types+node@22._488da0f7fe1db44f83d148c27853ce31/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/pc02/projects/apologify.com/node_modules/.pnpm/astro@5.8.0_@types+node@22._488da0f7fe1db44f83d148c27853ce31/node_modules/astro/components/ClientRouter.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a, _b;
const $$Astro$1 = createAstro("https://apologify.com");
const $$LayoutBase = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$LayoutBase;
  const {
    title = "Apology Letters",
    description = "Create heartfelt apology letters with our easy-to-use generator. Mend relationships and express sincere regret effectively. Free templates and expert tips.",
    schema
  } = Astro2.props;
  return renderTemplate(_b || (_b = __template(['<html lang="en" data-theme="light"> <head><meta charset="UTF-8"><meta name="description"', '><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', '><meta property="og:title"', '><meta property="og:description"', '><link rel="sitemap" href="/sitemap-index.xml"><title>', '</title><script defer src="https://umamisoto.vercel.app/script.js" data-website-id="ff7f84cf-5ca1-42f7-a6c9-e45cd9e74131" data-domains="bestapologyletters.com,apologify.com"><\/script>', "", "", '</head> <body class="flex flex-col min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50"> ', " </body></html>"])), addAttribute(description, "content"), addAttribute(Astro2.generator, "content"), addAttribute(title, "content"), addAttribute(description, "content"), title, schema && renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify(schema))), renderComponent($$result, "ViewTransitions", $$ClientRouter, {}), renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/pc02/projects/apologify.com/src/layouts/LayoutBase.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="bg-white "> <div class="w-full max-w-screen-xl mx-auto px-4 py-2 sm:py-6 flex justify-between items-center"> <a href="/" class="text-lg font-bold text-gray-800 flex items-center"> <span class="text-4xl md:text-5xl" role="img" aria-label="Apology letter">💌</span>
Apologify
</a> <a href="/generator" class="btn btn-primary text-white "> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"> <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path> </svg>
Write
</a> </div> </header>`;
}, "C:/Users/pc02/projects/apologify.com/src/components/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const importantRecipients = [
    { value: "boss", label: "Boss" },
    { value: "colleague", label: "Colleague" },
    { value: "client", label: "Client" },
    { value: "friend", label: "Friend" },
    { value: "partner", label: "Partner" },
    { value: "teacher", label: "Teacher" }
  ];
  return renderTemplate`${maybeRenderHead()}<footer class="bg-base-200 text-base-content"> <div class="w-full max-w-screen-lg mx-auto py-16 px-4"> <div class="grid grid-cols-1 md:grid-cols-3 gap-8"> <div class=""> <h3 class="text-lg font-semibold mb-4">Apologify</h3> <p class="text-sm">Create personalized apology letters with ease using our AI-powered tool.</p> </div> <div> <h3 class="text-lg font-semibold mb-4">Quick Links</h3> <ul class="space-y-2"> <li><a href="/" class="hover:underline">Home</a></li> <li><a href="/about" class="hover:underline">About Us</a></li> <li><a href="/generator" class="hover:underline">Generate Letter</a></li> <li><a href="/examples" class="hover:underline">Example Letters</a></li> <li><a href="/articles" class="hover:underline">Articles</a></li> <li><a href="/contact" class="hover:underline">Contact Us</a></li> </ul> </div> <div> <h3 class="text-lg font-semibold mb-4">Popular Letters</h3> <ul class="space-y-2"> ${importantRecipients.map((recipient) => renderTemplate`<li> <a${addAttribute(`/examples/${recipient.value}`, "href")} class="hover:underline">
Apology to ${recipient.label} </a> </li>`)} </ul> </div> <!-- <div>
        <h3 class="text-lg font-semibold mb-4">Legal</h3>
        <ul class="space-y-2">
          <li><a href="/privacy" class="hover:underline">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:underline">Terms of Service</a></li>
        </ul>

        <h3 class="text-lg font-semibold mt-6 mb-4">Follow Us</h3>
        <div class="flex space-x-4">
          <a href="#" class="text-xl hover:text-primary" aria-label="Facebook">
            <i class="fab fa-facebook"></i>
          </a>
          <a href="#" class="text-xl hover:text-primary" aria-label="Twitter">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="#" class="text-xl hover:text-primary" aria-label="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="#" class="text-xl hover:text-primary" aria-label="LinkedIn">
            <i class="fab fa-linkedin"></i>
          </a>
        </div>
      </div> --> </div> <div class="mt-8 pt-8 border-t border-base-300 text-center"> <p>&copy; ${currentYear} Apology Letter Generator. All rights reserved.</p> </div> </div> </footer>`;
}, "C:/Users/pc02/projects/apologify.com/src/components/Footer.astro", void 0);

const $$Astro = createAstro("https://apologify.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description = title, schema } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "LayoutBase", $$LayoutBase, { "title": title, "description": description, "schema": schema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="flex-grow w-full max-w-screen-xl mx-auto px-4"> ${renderSlot($$result2, $$slots["default"])} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/layouts/Layout.astro", void 0);

export { $$Layout as $, $$LayoutBase as a };
