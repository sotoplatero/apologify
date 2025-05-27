/* empty css                                 */
import { c as createAstro, a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, e as renderSlot } from '../chunks/astro/server_Cb_NEMlC.mjs';
import { a as $$LayoutBase, $ as $$Layout } from '../chunks/Layout_Cn7SE8F0.mjs';
import { a as actions } from '../chunks/_astro_actions_BEReH5zP.mjs';
import { f as fallback, L as Letter } from '../chunks/Letter_DcxdwbD1.mjs';
import { p as push, c as attr_style, d as attr_class, a as attr, e as escape_html, b as bind_props, f as pop, s as stringify } from '../chunks/_@astro-renderers_DSKGcwIg.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DSKGcwIg.mjs';
/* empty css                                 */

const $$Astro$1 = createAstro("https://apologify.com");
const $$WizardLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$WizardLayout;
  const { title, description = title, schema } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "LayoutBase", $$LayoutBase, { "title": title, "description": description, "schema": schema }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="flex-grow w-full mx-auto px-4"> ${renderSlot($$result2, $$slots["default"])} </main> ` })}`;
}, "C:/Users/pc02/projects/apologify.com/src/layouts/WizardLayout.astro", void 0);

function ApologyWizard($$payload, $$props) {
	push();

	let progressWidth;

	const tones = [
		{
			value: 'formal',
			label: 'Formal',
			description: 'Respectful and structured.'
		},
		{
			value: 'casual',
			label: 'Casual',
			description: 'Relaxed and friendly.'
		},
		{
			value: 'heartfelt',
			label: 'Heartfelt',
			description: 'Genuine and emotional.'
		},
		{
			value: 'professional',
			label: 'Professional',
			description: 'Polished and tactful.'
		},
		{
			value: 'remorseful',
			label: 'Remorseful',
			description: 'Deeply regretful.'
		},
		{
			value: 'humorous',
			label: 'Humorous',
			description: 'Light and witty.'
		},
		{
			value: 'emotional',
			label: 'Emotional',
			description: 'Emotional and heartfelt.'
		},
		{
			value: 'apologetic',
			label: 'Apologetic',
			description: 'Apologetic and sincere.'
		},
		{
			value: 'other',
			label: 'Other',
			description: 'Custom tone'
		}
	];
	let initialType = fallback($$props['initialType'], 'personal');
	let currentStep = 1;
	const totalSteps = 4;
	let letterType = 'personal';
	let selectedTone = tones[0]?.value;
	let context = '';

	function validateStep(step) {
		switch (step) {
			case 1:
				return !!letterType;

			case 2:
				return false;

			case 3:
				return (selectedTone !== 'other');

			case 4:
				return !!context.trim();

			default:
				return false;
		}
	}

	if (initialType) {
		letterType = initialType;
	}

	progressWidth = `${currentStep / totalSteps * 100}%`;
	$$payload.out += `<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden"><div class="fixed top-0 left-0 right-0 z-50"><div class="h-1 bg-gray-200"><div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"${attr_style(`width: ${stringify(progressWidth)}`)}></div></div></div> <div class="fixed top-6 right-6 z-50"><button aria-label="Close wizard" class="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"><svg class="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="min-h-screen flex items-center justify-center p-6 pb-24"><div class="w-full max-w-2xl"><div id="write-letter">`;

	{
		$$payload.out += '<!--[-->';
		$$payload.out += `<div class="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 svelte-yf4dav"><div class="space-y-4"><h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">What type of apology letter do you need?</h1> <p class="text-xl text-gray-600">Choose the category that best fits your situation</p></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"><button type="button"${attr_class(`group p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${stringify(letterType === 'professional' ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md')}`)}><div class="flex flex-col items-center space-y-4"><div${attr_class(`w-16 h-16 rounded-full ${stringify(letterType === 'professional' ? 'bg-purple-100' : 'bg-gray-100')} flex items-center justify-center group-hover:scale-110 transition-transform`)}><svg${attr_class(`w-8 h-8 ${stringify(letterType === 'professional' ? 'text-purple-600' : 'text-gray-600')}`)} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div> <div class="text-center"><h3 class="text-2xl font-semibold text-gray-800">Professional</h3> <p class="text-gray-600 mt-2">Work &amp; Business Relations</p></div></div></button> <button type="button"${attr_class(`group p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${stringify(letterType === 'personal' ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md')}`)}><div class="flex flex-col items-center space-y-4"><div${attr_class(`w-16 h-16 rounded-full ${stringify(letterType === 'personal' ? 'bg-purple-100' : 'bg-gray-100')} flex items-center justify-center group-hover:scale-110 transition-transform`)}><svg${attr_class(`w-8 h-8 ${stringify(letterType === 'personal' ? 'text-purple-600' : 'text-gray-600')}`)} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></div> <div class="text-center"><h3 class="text-2xl font-semibold text-gray-800">Personal</h3> <p class="text-gray-600 mt-2">Family, Friends &amp; Loved Ones</p></div></div></button></div></div>`;
	}

	$$payload.out += `<!--]--> `;

	{
		$$payload.out += '<!--[!-->';
	}

	$$payload.out += `<!--]--> `;

	{
		$$payload.out += '<!--[!-->';
	}

	$$payload.out += `<!--]--> `;

	{
		$$payload.out += '<!--[!-->';
	}

	$$payload.out += `<!--]--> `;

	{
		$$payload.out += '<!--[!-->';
	}

	$$payload.out += `<!--]--></div></div></div> `;

	{
		$$payload.out += '<!--[-->';
		$$payload.out += `<div class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-6"><div class="max-w-2xl mx-auto flex justify-between items-center"><button type="button"${attr('disabled', currentStep === 1, true)} class="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> <span class="font-medium">Previous</span></button> <div class="flex items-center space-x-2"><span class="text-sm text-gray-500">${escape_html(currentStep)} of 4</span></div> `;

		{
			$$payload.out += '<!--[!-->';
			$$payload.out += `<button type="button"${attr('disabled', !validateStep(currentStep), true)} class="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"><span>Next</span> <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`;
		}

		$$payload.out += `<!--]--></div></div>`;
	}

	$$payload.out += `<!--]--></div>`;
	bind_props($$props, { initialType });
	pop();
}

const $$Astro = createAstro("https://apologify.com");
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const result = Astro2.getActionResult(actions.createLetter);
  return renderTemplate`${!result?.data ? renderTemplate`${renderComponent($$result, "WizardLayout", $$WizardLayout, { "title": "Apology Letter Generator", "description": "Generate a personalized apology letter in just a few steps" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead()}<div class="w-full mx-auto py-16">${renderComponent($$result2, "ApologyWizard", ApologyWizard, { "client:load": true, "initialType": "personal", "client:component-hydration": "load", "client:component-path": "C:/Users/pc02/projects/apologify.com/src/components/ApologyWizard.svelte", "client:component-export": "default" })}</div>` })}` : renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Apology Letter Generator" }, { "default": ($$result2) => renderTemplate`<div class="max-w-4xl mx-auto py-16"><h1 class="text-3xl font-bold mb-8 text-center">Your Generated Letter</h1>${result?.error ? renderTemplate`<div class="alert alert-error"><p>Error generating letter</p></div>` : renderTemplate`${renderComponent($$result2, "Letter", Letter, { "client:load": true, "letter": result.data.letter, "client:component-hydration": "load", "client:component-path": "C:/Users/pc02/projects/apologify.com/src/components/Letter.svelte", "client:component-export": "default" })}`}<div class="text-center mt-8"><a href="/generator/wizard" class="btn btn-primary">
Write Another Letter
</a></div></div>` })}`}`;
}, "C:/Users/pc02/projects/apologify.com/src/pages/generator/index.astro", void 0);

const $$file = "C:/Users/pc02/projects/apologify.com/src/pages/generator/index.astro";
const $$url = "/generator";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
