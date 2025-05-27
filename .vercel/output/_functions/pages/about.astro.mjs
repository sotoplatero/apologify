/* empty css                                 */
import { a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cb_NEMlC.mjs';
import { $ as $$Layout } from '../chunks/Layout_Cn7SE8F0.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "About Us", "description": "Learn more about our website and mission" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="prose prose-lg mx-auto mt-16"> <h1>About Us</h1> <p>
Welcome to our website. We are dedicated to providing valuable information and resources about writing apology letters in various contexts.
</p> <p>
Our mission is to help people communicate effectively and mend relationships through well-crafted apologies.
</p> <!-- Añade más contenido sobre tu sitio aquí --> </div> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/about.astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
