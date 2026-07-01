<script lang="ts">
  import { actions } from "astro:actions";
  import { onDestroy } from "svelte";
  import { listThemes, isPremiumTheme } from "../lib/themes.js";

  export let slug: string;
  export let initialTheme = "classic";

  const themes = listThemes();
  let selectedTheme = initialTheme;
  let saving = false;
  let error = "";

  $: premiumSelected = isPremiumTheme(selectedTheme);
  // Reuse the real page as the preview — it already exists in the DB.
  $: previewSrc = `/sorry/${slug}?preview=1&theme=${selectedTheme}`;

  async function save() {
    saving = true; error = "";
    const { data, error: e } = await actions.updateApologyTheme({ slug, theme: selectedTheme });
    if (e) { error = e.message || "Couldn't save. Please try again."; saving = false; return; }
    if (data?.updated) window.location.href = "/dashboard";
    else { error = "Couldn't save. Please try again."; saving = false; }
  }

  // Lock background scroll while the full-screen editor is open.
  function setScrollLock(on: boolean) {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("overflow-hidden", on);
    document.body.classList.toggle("overflow-hidden", on);
  }
  setScrollLock(true);
  onDestroy(() => setScrollLock(false));
</script>

<div class="fixed inset-0 z-50 flex flex-col lg:flex-row bg-base-200 font-sans">
  <!-- Live preview of the real page -->
  <div class="relative flex-1 min-h-0">
    <iframe src={previewSrc} title="Apology page preview" class="w-full h-full border-0"></iframe>
  </div>

  <!-- Control panel: sidebar on desktop, bottom sheet on mobile -->
  <aside class="shrink-0 flex flex-col bg-base-100 border-t border-base-300 lg:border-t-0 lg:border-l lg:w-[380px] lg:h-full max-h-[46vh] lg:max-h-none shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.18)] lg:shadow-none">
    <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-base-300">
      <div class="min-w-0">
        <h2 class="font-display text-lg font-semibold text-base-content leading-none truncate">Change the design</h2>
        <p class="text-xs text-base-content/50 mt-1">Live · saves to your published page</p>
      </div>
      <a href="/dashboard" class="btn btn-ghost btn-sm shrink-0">Cancel</a>
    </div>

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
        <p class="text-xs text-warning mt-3 leading-relaxed">This is a PRO design — it will save as Letter until you upgrade.</p>
      {/if}
    </div>

    <div class="px-5 py-3.5 border-t border-base-300">
      {#if error}<p class="text-error text-sm mb-2 text-center" role="alert">{error}</p>{/if}
      <button on:click={save} disabled={saving} class="btn btn-primary btn-block">
        {saving ? "Saving…" : "Save design"}
      </button>
    </div>
  </aside>
</div>
