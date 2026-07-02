<script lang="ts">
  import { actions } from "astro:actions";
  import { onDestroy, onMount } from "svelte";
  import { tones } from "../lib/apologyData.js";
  import { listThemes, isPremiumTheme } from "../lib/themes.js";

  export let initialToWhom = "";
  // Design the user picked before landing here (e.g. from a /demo "Use this
  // design" CTA). Defaults to the Letter design.
  export let initialTheme = "classic";

  const themes = listThemes();

  let toWhom = initialToWhom;
  let reason = "";
  let signature = "";
  let selectedTone = "heartfelt";

  let isGenerating = false;
  let error = "";

  // Draft result (preview step)
  let slug = "";
  let selectedTheme = initialTheme;

  $: premiumSelected = isPremiumTheme(selectedTheme);
  // The preview is the real apology page rendered in an iframe — perfectly
  // faithful, and each template is defined only once (server-side).
  $: previewSrc = slug ? `/sorry/${slug}?preview=1&theme=${selectedTheme}` : "";

  async function generate() {
    if (!toWhom.trim()) { error = "Tell us who this apology is for."; return; }
    if (!signature.trim()) { error = "Add a signature — who is apologizing?"; return; }
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
      else if (data && data.saved) { slug = data.slug; selectedTheme = initialTheme; }
      else error = "We couldn't create your page. Please try again.";
    } catch (e) { error = "Something went wrong. Please try again."; console.error(e); }
    finally { isGenerating = false; }
  }

  function editDetails() { slug = ""; error = ""; }

  // Honor a design preselected via ?theme= (e.g. the /demo "Use this design"
  // CTA), so the editor opens on that design.
  onMount(() => {
    const p = new URLSearchParams(window.location.search).get("theme");
    if (p && themes.some((t) => t.id === p)) { initialTheme = p; selectedTheme = p; }
  });

  // Publish directly from here. Signed-in users go straight to their live page
  // in one click; anonymous users are sent to sign-up and finish on /publish
  // (so there's never a second "Publish" button for someone already signed in).
  let publishing = false;
  let publishError = "";
  async function publish() {
    publishing = true; publishError = "";
    const { data, error: e } = await actions.publishApologyPage({ slug, theme: selectedTheme || undefined });
    if (e) {
      if ((e as any).code === "UNAUTHORIZED") {
        const back = `/publish?slug=${slug}&theme=${selectedTheme}`;
        window.location.href = `/sign-up?redirect_url=${encodeURIComponent(back)}`;
        return;
      }
      publishError = e.message || "Couldn't publish. Please try again.";
      publishing = false;
      return;
    }
    if (data?.published) window.location.href = `/sorry/${slug}?published=1`;
    else { publishError = "Couldn't publish. Please try again."; publishing = false; }
  }

  // Lock background scroll while the full-screen editor is open, so there's no
  // double scrollbar and the page behind can't move. Restored on close/unmount.
  function setScrollLock(on: boolean) {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("overflow-hidden", on);
    document.body.classList.toggle("overflow-hidden", on);
  }
  $: setScrollLock(!!slug);
  onDestroy(() => setScrollLock(false));
</script>

{#if !slug}
  <!-- Step 1: the generator form -->
  <div class="max-w-2xl mx-auto bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 md:p-8 font-sans">
    <form on:submit|preventDefault={generate}>
      <div class="mb-5">
        <label for="towhom" class="font-semibold text-base-content block mb-2">Who is this apology for?</label>
        <input id="towhom" bind:value={toWhom} maxlength="100" placeholder="e.g. Mia, my girlfriend, our customers"
          class="input input-bordered w-full bg-base-100" />
      </div>

      <div class="mb-5">
        <div class="flex items-baseline justify-between mb-2">
          <label for="reason" class="font-semibold text-base-content">What happened?</label>
          <span class="text-xs text-base-content/50 tabular-nums">{reason.length}/500</span>
        </div>
        <textarea id="reason" bind:value={reason} maxlength="500" autocomplete="off"
          placeholder="Describe what you did and why you want to apologize..."
          class="textarea textarea-bordered w-full h-28 resize-none bg-base-100 text-base leading-relaxed"></textarea>
      </div>

      <div class="mb-5">
        <label for="sig" class="font-semibold text-base-content block mb-2">Signature</label>
        <input id="sig" bind:value={signature} maxlength="80" placeholder="Who's apologizing? e.g. Sam"
          class="input input-bordered w-full bg-base-100" />
      </div>

      <div class="mb-6">
        <label for="tone" class="font-semibold text-base-content block mb-2">Tone</label>
        <select id="tone" bind:value={selectedTone} class="select select-bordered w-full bg-base-100">
          {#each tones as t (t.value)}<option value={t.value}>{t.emoji} {t.label}</option>{/each}
        </select>
      </div>

      {#if error}<div class="p-4 mb-6 bg-error/10 border border-error/25 rounded-xl text-error text-sm" role="alert">{error}</div>{/if}

      <button type="submit" disabled={isGenerating} class="btn btn-primary btn-lg w-full text-base">
        {isGenerating ? "Writing your apology..." : "Generate my apology page"}
      </button>
    </form>
  </div>
{:else}
  <!-- Step 2: full-screen editor — live preview + a design panel.
       Desktop: preview left, persistent panel right.
       Mobile: preview on top, bottom sheet with a horizontal design filmstrip. -->
  <div class="fixed inset-0 z-50 flex flex-col lg:flex-row bg-base-200 font-sans">
    <!-- Live preview (real page in an iframe) -->
    <div class="relative flex-1 min-h-0">
      <iframe src={previewSrc} title="Apology preview" class="w-full h-full border-0"></iframe>
    </div>

    <!-- Control panel: sidebar on desktop, bottom sheet on mobile -->
    <aside class="shrink-0 flex flex-col bg-base-100 border-t border-base-300 lg:border-t-0 lg:border-l lg:w-[380px] lg:h-full max-h-[46vh] lg:max-h-none shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.18)] lg:shadow-none">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-base-300">
        <div class="min-w-0">
          <h2 class="font-display text-lg font-semibold text-base-content leading-none truncate">Your apology page</h2>
          <p class="text-xs text-base-content/50 mt-1">Draft — only you can see it</p>
        </div>
        <button on:click={editDetails} class="btn btn-ghost btn-sm gap-1.5 shrink-0">
          <svg class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Edit
        </button>
      </div>

      <!-- Scrollable body: design picker -->
      <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-3">Choose a design</h3>
        <div
          role="radiogroup"
          aria-label="Apology page design"
          class="flex gap-3 overflow-x-auto overscroll-x-contain pb-2 -mx-1 px-1 lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible"
        >
          {#each themes as th}
            <button
              type="button"
              role="radio"
              aria-checked={selectedTheme === th.id}
              on:click={() => (selectedTheme = th.id)}
              class="group shrink-0 w-32 lg:w-auto text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            >
              <div class={`relative rounded-lg overflow-hidden border-2 transition-all ${selectedTheme === th.id ? 'border-primary ring-2 ring-primary/20' : 'border-base-300 group-hover:border-base-content/30'}`}>
                <img
                  src={`/designs/${th.id}.jpg`}
                  alt={`${th.label} design preview`}
                  loading="lazy"
                  width="320"
                  height="240"
                  class="w-full aspect-[4/3] object-cover object-top bg-base-200"
                />
                {#if th.premium}
                  <span class="absolute top-1.5 left-1.5 text-[9px] font-bold bg-warning text-warning-content px-1 rounded">PRO</span>
                {/if}
                {#if selectedTheme === th.id}
                  <span class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center shadow" aria-hidden="true">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </span>
                {/if}
              </div>
              <span class={`block mt-1.5 text-xs ${selectedTheme === th.id ? 'text-base-content font-semibold' : 'text-base-content/70'}`}>
                <span aria-hidden="true">{th.emoji}</span> {th.label}
              </span>
            </button>
          {/each}
        </div>
        {#if premiumSelected}
          <p class="text-xs text-warning mt-3 leading-relaxed">This is a PRO design — it will publish as Letter until you upgrade.</p>
        {/if}
      </div>

      <!-- Footer: publish -->
      <div class="px-5 py-3.5 border-t border-base-300">
        {#if publishError}
          <p class="text-error text-sm mb-2 text-center" role="alert">{publishError}</p>
        {/if}
        <button on:click={publish} disabled={publishing} class="btn btn-primary btn-block">
          {publishing ? "Publishing…" : "Publish & get a shareable link →"}
        </button>
        <p class="text-center text-xs text-base-content/50 mt-2">Makes your page public &amp; findable · free account required</p>
      </div>
    </aside>
  </div>
{/if}
