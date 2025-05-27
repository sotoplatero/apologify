import { a as attr, b as bind_props, e as escape_html } from './_@astro-renderers_DSKGcwIg.mjs';
/* empty css                          */

// Store the references to globals in case someone tries to monkey patch these, causing the below
// to de-opt (this occurs often when using popular extensions).

/**
 * @template V
 * @param {V} value
 * @param {V | (() => V)} fallback
 * @param {boolean} [lazy]
 * @returns {V}
 */
function fallback(value, fallback, lazy = false) {
	return value === undefined
		? lazy
			? /** @type {() => V} */ (fallback)()
			: /** @type {V} */ (fallback)
		: value;
}

function CopyButton($$payload, $$props) {
	let text = fallback($$props['text'], '');

	$$payload.out += `<div class="relative inline-block">`;

	{
		$$payload.out += '<!--[!-->';
	}

	$$payload.out += `<!--]--> <button class="copy-button btn btn-outline btn-sm flex items-center"${attr('aria-label', "Copy to clipboard")}>`;

	{
		$$payload.out += '<!--[!-->';
		$$payload.out += `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"></path></svg> Copy`;
	}

	$$payload.out += `<!--]--></button></div>`;
	bind_props($$props, { text });
}

function Letter($$payload, $$props) {
	let letter = $$props['letter'];

	$$payload.out += `<div class="letter-container max-w-4xl mx-auto svelte-18o9j6d"><div class="letter-header bg-gradient-to-r from-purple-100 via-purple-50 to-blue-100 rounded-t-2xl p-6 border-b-2 border-purple-200 shadow-sm"><div class="flex items-center justify-between"><div class="flex items-center space-x-4"><div class="flex items-center space-x-2"><div class="w-3 h-3 bg-purple-500 rounded-full"></div> <div class="w-3 h-3 bg-blue-500 rounded-full"></div> <div class="w-3 h-3 bg-green-500 rounded-full"></div></div> <div class="text-sm text-gray-700 font-semibold">Apology Letter</div></div> <div class="flex items-center">`;
	CopyButton($$payload, { text: letter });
	$$payload.out += `<!----></div></div></div> <div class="letter-body bg-white/90 backdrop-blur-sm shadow-xl rounded-b-2xl border-2 border-gray-200 relative overflow-hidden svelte-18o9j6d"><div class="absolute inset-0 opacity-5"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="paper-lines" x="0" y="0" width="100%" height="32" patternUnits="userSpaceOnUse"><line x1="0" y1="31" x2="100%" y2="31" stroke="#e5e7eb" stroke-width="1"></line></pattern></defs><rect width="100%" height="100%" fill="url(#paper-lines)"></rect></svg></div> <div class="relative p-8 md:p-12"><div class="letter-content"><div class="prose prose-lg max-w-none"><div class="letter-text text-gray-800 leading-relaxed text-lg font-light tracking-wide whitespace-pre-wrap svelte-18o9j6d">${escape_html(letter)}</div></div></div></div> <div class="absolute inset-0 rounded-b-2xl shadow-inner pointer-events-none"></div></div> `;

	{
		$$payload.out += '<!--[!-->';
	}

	$$payload.out += `<!--]--></div>`;
	bind_props($$props, { letter });
}

export { Letter as L, fallback as f };
