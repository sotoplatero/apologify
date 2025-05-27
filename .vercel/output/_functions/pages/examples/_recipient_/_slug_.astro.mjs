/* empty css                                       */
import { c as createAstro, a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../../chunks/astro/server_Cb_NEMlC.mjs';
import { $ as $$Layout } from '../../../chunks/Layout_Cn7SE8F0.mjs';
import { g as getCollection } from '../../../chunks/_astro_content_BDmLRPwN.mjs';
import { r as recipients } from '../../../chunks/apologyData_SMoAwM42.mjs';
import { L as Letter } from '../../../chunks/Letter_DcxdwbD1.mjs';
import { $ as $$CallToAction } from '../../../chunks/CallToAction_B5EKILy2.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DSKGcwIg.mjs';

const $$Astro = createAstro("https://apologify.com");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { recipient, slug } = Astro2.params;
  const allLetters = await getCollection("letters");
  const letter = allLetters.find((l) => {
    const pathParts = l.id.split("/");
    const letterSlug = pathParts[pathParts.length - 1].replace(".json", "");
    const letterRecipient = pathParts[0];
    return letterRecipient === recipient && letterSlug === slug;
  });
  if (!letter) {
    return Astro2.redirect("/404");
  }
  const recipientLabel = recipients.find((r) => r.value === recipient)?.label || recipient;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Apology Letters to ${recipientLabel}`, "description": `Example apology letters to ${recipientLabel}. ${letter.data?.context || ""}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-screen-md mx-auto px-4  py-8"> <h1 class="text-4xl font-bold mb-4 text-center">Apology Letters to ${recipientLabel}. <br> ${letter.data?.context || "Example Letter"}</h1> <!-- <p class="text-center text-gray-600 mb-8">Context: {letter.data.context}</p> --> <div class="flex flex-col gap-8"> ${letter.data?.letters?.map((letterText, index) => renderTemplate`${renderComponent($$result2, "Letter", Letter, { "letter": letterText, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/Letter.svelte", "client:component-export": "default" })}`) || renderTemplate`<p class="text-center text-gray-600">No letters available for this example.</p>`} </div> <div class="my-16 flex justify-center"> <a${addAttribute(`/examples/${recipient}`, "href")} class="btn btn-outline capitalize"> ${recipientLabel} Letters
</a> </div> ${renderComponent($$result2, "CallToAction", $$CallToAction, {})} </main> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/examples/[recipient]/[slug].astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/examples/[recipient]/[slug].astro";
const $$url = "/examples/[recipient]/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
