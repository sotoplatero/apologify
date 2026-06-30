<script lang="ts">
  import { actions } from "astro:actions";
  import { tones } from "../lib/apologyData.js";
  import { listThemes, resolveTheme, isPremiumTheme } from "../lib/themes.js";
  import { apologyHeading, apologyParagraphsHtml } from "../lib/display.js";

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
  let drawerOpen = true;

  $: theme = resolveTheme(selectedTheme);
  $: heading = apologyHeading(toWhom);
  $: paragraphsHtml = apologyParagraphsHtml(message);
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
      else if (data && data.saved) { slug = data.slug; title = data.title; message = data.message; selectedTheme = "classic"; drawerOpen = true; }
      else error = "We couldn't create your page. Please try again.";
    } catch (e) { error = "Something went wrong. Please try again."; console.error(e); }
    finally { isGenerating = false; }
  }

  function editDetails() {
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
  <!-- Step 2: full-screen dedicated preview + control drawer -->
  <div class={`fixed inset-0 z-50 overflow-y-auto ${theme.bgClass} ${theme.font}`}>
    <div class="min-h-full w-full flex flex-col items-center justify-center px-5 py-16 sm:py-24">
      <div class="w-full max-w-2xl">
        <header class="text-center mb-10">
          <p class={`text-[0.7rem] uppercase tracking-[0.3em] mb-4 opacity-60 ${theme.accentClass}`}>Preview · not published</p>
          <h1 class={`text-4xl sm:text-5xl font-semibold leading-[1.1] ${theme.accentClass}`} style="text-wrap: balance;">{title}</h1>
        </header>
        <article class={`rounded-[1.75rem] shadow-2xl shadow-black/5 px-7 py-9 sm:px-12 sm:py-14 ${theme.cardClass}`}>
          {#if heading}<p class={`text-xl sm:text-2xl mb-7 ${theme.accentClass}`}>{heading}</p>{/if}
          <div class={`space-y-5 text-lg sm:text-xl leading-[1.75] ${theme.bodyClass}`}>
            {#each paragraphsHtml as p}<p>{@html p}</p>{/each}
          </div>
          {#if signature.trim()}<p class={`mt-12 text-right text-3xl sm:text-4xl font-cursive leading-none ${theme.accentClass}`}>{signature.trim()}</p>{/if}
        </article>
      </div>
    </div>
  </div>

  <!-- Drawer toggle (when closed) -->
  {#if !drawerOpen}
    <button on:click={() => (drawerOpen = true)}
      class="fixed top-5 right-5 z-[70] flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
      Customize
    </button>
  {/if}

  <!-- Scrim -->
  {#if drawerOpen}
    <button aria-label="Close panel" on:click={() => (drawerOpen = false)} class="fixed inset-0 z-[60] bg-black/30 sm:bg-black/10"></button>
  {/if}

  <!-- Control drawer -->
  <aside class={`fixed top-0 right-0 z-[65] h-full w-full sm:w-[384px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <div>
        <h2 class="font-display text-xl font-semibold text-gray-900 leading-none">Your apology page</h2>
        <p class="text-xs text-gray-400 mt-1">Draft — only you can see it</p>
      </div>
      <button on:click={() => (drawerOpen = false)} aria-label="Close" class="p-2 -mr-2 text-gray-400 hover:text-gray-700 transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-6 space-y-7">
      <button on:click={editDetails} class="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Edit details &amp; regenerate
      </button>

      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Theme</h3>
        <div class="grid grid-cols-3 gap-3">
          {#each themes as th}
            <button type="button" on:click={() => (selectedTheme = th.id)} title={th.label}
              class="group relative text-left">
              <span class={`block h-16 w-full rounded-xl ${th.bgClass} border-2 transition-all ${selectedTheme === th.id ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200 group-hover:border-gray-400'}`}></span>
              <span class={`block mt-1.5 text-xs ${selectedTheme === th.id ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{th.emoji} {th.label}</span>
              {#if th.premium}<span class="absolute top-1.5 right-1.5 text-[9px] font-bold bg-amber-400 text-white px-1 rounded">PRO</span>{/if}
            </button>
          {/each}
        </div>
        {#if premiumSelected}
          <p class="text-xs text-amber-600 mt-3 leading-relaxed">This is a PRO theme — it will publish as Classic until you upgrade.</p>
        {/if}
      </div>
    </div>

    <div class="px-6 py-5 border-t border-gray-100">
      <a href={`/publish?slug=${slug}&theme=${selectedTheme}`}
        class="block w-full px-6 py-3.5 bg-gray-900 text-white text-center text-base font-semibold rounded-xl hover:bg-gray-800 transition-colors">
        Publish &amp; get a shareable link →
      </a>
      <p class="text-center text-xs text-gray-400 mt-2.5">No link until you publish · sign-in required</p>
    </div>
  </aside>
{/if}
