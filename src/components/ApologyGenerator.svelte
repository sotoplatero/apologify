<script lang="ts">
  import { actions } from "astro:actions";
  import { tones } from "../lib/apologyData.js";
  import { listThemes, resolveTheme, isPremiumTheme } from "../lib/themes.js";
  import { apologyHeading } from "../lib/display.js";

  // Optional prefill for the "to whom" field (used by SEO landing pages).
  export let initialToWhom = "";

  const themes = listThemes();

  let toWhom = initialToWhom;
  let reason = "";
  let signature = "";
  let selectedTone = "heartfelt";

  let isGenerating = false;
  let error = "";

  // Draft result (preview step)
  let slug = "";
  let title = "";
  let message = "";
  let selectedTheme = "classic";

  $: theme = resolveTheme(selectedTheme);
  $: heading = apologyHeading(toWhom);
  $: paragraphs = message.split(/\n{2,}/).filter(Boolean);
  $: premiumSelected = isPremiumTheme(selectedTheme);

  async function generate() {
    if (!toWhom.trim()) { error = "Tell us who this apology is for."; return; }
    if (reason.trim().length < 20) { error = "Describe what happened (at least 20 characters)."; return; }
    isGenerating = true; error = "";
    try {
      const fd = new FormData();
      fd.append("relationship", toWhom.trim());
      if (signature.trim()) fd.append("senderName", signature.trim());
      fd.append("context", reason);
      fd.append("tone", selectedTone);
      const { data, error: actionError } = await actions.createApologyPage(fd);
      if (actionError) error = actionError.message;
      else if (data && data.saved) { slug = data.slug; title = data.title; message = data.message; selectedTheme = "classic"; }
      else error = "We couldn't create your page. Please try again.";
    } catch (e) { error = "Something went wrong. Please try again."; console.error(e); }
    finally { isGenerating = false; }
  }

  function editDetails() {
    // Back to the form, keeping inputs so the user can tweak and regenerate.
    slug = ""; message = ""; title = ""; error = "";
  }
</script>

{#if !slug}
  <!-- Step 1: the generator form -->
  <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
    <form on:submit|preventDefault={generate}>
      <div class="mb-5">
        <label for="towhom" class="font-semibold text-gray-900 block mb-2">Who is this apology for?</label>
        <input id="towhom" bind:value={toWhom} maxlength="100" placeholder="e.g. Mia, my girlfriend, our customers"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
      </div>

      <div class="mb-5">
        <div class="flex items-baseline justify-between mb-2">
          <label for="reason" class="font-semibold text-gray-900">What happened?</label>
          <span class="text-xs text-gray-400 tabular-nums">{reason.length}/500</span>
        </div>
        <textarea id="reason" bind:value={reason} maxlength="500" autocomplete="off"
          placeholder="Describe what you did and why you want to apologize..."
          class="w-full h-28 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
      </div>

      <div class="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label for="tone" class="font-semibold text-gray-900 block mb-2">Tone</label>
          <select id="tone" bind:value={selectedTone}
            class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            {#each tones as t (t.value)}<option value={t.value}>{t.emoji} {t.label}</option>{/each}
          </select>
        </div>
        <div>
          <label for="sig" class="font-semibold text-gray-900 block mb-2">Signature <span class="text-gray-400 font-normal">(optional)</span></label>
          <input id="sig" bind:value={signature} maxlength="80" placeholder="Who's apologizing? e.g. Sam"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
        </div>
      </div>

      {#if error}<div class="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm" role="alert">{error}</div>{/if}

      <button type="submit" disabled={isGenerating}
        class="w-full px-6 py-4 bg-purple-600 text-white text-lg font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
        {isGenerating ? "Writing your apology..." : "Generate my apology page"}
      </button>
    </form>
  </div>
{:else}
  <!-- Step 2: live WYSIWYG preview with hot-swappable theme -->
  <div class="max-w-2xl mx-auto">
    <p class="text-center text-sm font-medium text-gray-400 mb-3 uppercase tracking-widest">Preview — not published yet</p>

    <!-- This mirrors how the live /sorry/[slug] page renders -->
    <div class={`rounded-3xl overflow-hidden border border-gray-200 shadow-sm ${theme.bgClass} ${theme.font}`}>
      <div class="flex items-center justify-center px-4 py-12">
        <article class="max-w-xl w-full bg-white/70 backdrop-blur rounded-3xl shadow-xl p-8 md:p-10 text-center">
          {#if heading}<h1 class={`text-2xl md:text-3xl font-bold mb-5 ${theme.accentClass}`} style="text-wrap: balance;">{heading}</h1>{/if}
          <div class="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed text-left">
            {#each paragraphs as p}<p>{p}</p>{/each}
          </div>
          {#if signature.trim()}<p class={`mt-7 text-lg ${theme.accentClass}`}>— {signature.trim()}</p>{/if}
        </article>
      </div>
    </div>

    <!-- Theme picker (hot swap, no regeneration) -->
    <div class="mt-6">
      <span class="font-semibold text-gray-900 block mb-2">Theme</span>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {#each themes as th}
          <button type="button" on:click={() => (selectedTheme = th.id)}
            class="relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all {selectedTheme === th.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}">
            <span class="text-2xl">{th.emoji}</span>
            <span class="text-xs text-gray-700">{th.label}</span>
            {#if th.premium}<span class="absolute top-1 right-1 text-[10px] bg-amber-400 text-white px-1 rounded">PRO</span>{/if}
          </button>
        {/each}
      </div>
      {#if premiumSelected}
        <p class="text-xs text-amber-600 mt-2">PRO theme — it will publish as Classic until you upgrade.</p>
      {/if}
    </div>

    <!-- Publish CTA (no share URL until published) -->
    <a href={`/publish?slug=${slug}&theme=${selectedTheme}`}
      class="mt-6 block px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-md text-center">
      Publish this page →
    </a>
    <p class="text-center text-xs text-gray-400 mt-2">Publishing makes it public &amp; gives you a shareable link.</p>

    <button on:click={editDetails} class="mt-5 mx-auto block text-sm text-gray-400 hover:text-purple-600">← Edit details &amp; regenerate</button>
  </div>
{/if}
