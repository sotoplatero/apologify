/* empty css                                 */
import { a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cb_NEMlC.mjs';
import { $ as $$Layout } from '../chunks/Layout_Cn7SE8F0.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const apologyNote = `Dear Visitor,

We sincerely apologize for the inconvenience. The page you're looking for seems to have gone missing, and we take full responsibility for this error.

We understand that your time is valuable, and we're truly sorry for any frustration this may have caused. Our team has been notified, and we're working diligently to resolve this issue.

In the meantime, please feel free to explore our homepage or browse through our example letters. If you can't find what you're looking for, don't hesitate to contact us.

Thank you for your understanding and patience.

Warm regards,
The Apology Letter Generator Team`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "404: Page Not Found", "description": "Sorry, we couldn't find the page you're looking for." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-16 text-center"> <h1 class="text-6xl font-bold text-primary mb-4">404</h1> <h2 class="text-3xl font-semibold mb-4">Page Not Found</h2> <p class="text-xl text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for.</p> <div class="max-w-screen-md bg-base-200 p-8 rounded-lg shadow-lg mx-auto mb-8 "> <h3 class="text-2xl font-semibold mb-4">Our Apology</h3> <p class="text-gray-700 whitespace-pre-line text-left">${apologyNote}</p> </div> <div class="flex justify-center space-x-4"> <a href="/" class="btn btn-primary"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"> <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path> </svg>
Go Home
</a> <a href="/examples" class="btn btn-outline"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"> <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path> </svg>
View Examples
</a> </div> </main> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/404.astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
