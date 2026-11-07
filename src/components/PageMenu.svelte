<script lang="ts">
  // ⋮ menu for one page on the dashboard: everything the owner can do with it.
  import { onMount } from "svelte";
  import { actions } from "astro:actions";

  export let slug: string;
  export let isPublic = true;
  export let recipientName: string | null = null;

  let open = false;
  let busy = false;
  let note = "";
  let menu: HTMLElement;
  let url = `https://apologify.com/sorry/${slug}`;
  let canShare = false;

  onMount(() => {
    url = `${window.location.origin}/sorry/${slug}`;
    canShare = !!navigator.share;
    const close = (e: MouseEvent) => { if (open && !menu.contains(e.target as Node)) open = false; };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") open = false; };
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  });

  function flash(text: string) {
    note = text;
    setTimeout(() => (note = ""), 2200);
  }

  async function copyLink() {
    open = false;
    try { await navigator.clipboard.writeText(url); flash("Link copied"); }
    catch (_) { flash("Couldn't copy — open the page and copy its address"); }
  }

  async function share() {
    open = false;
    const text = "I wrote you something 💛";
    try {
      if (navigator.share) { await navigator.share({ title: recipientName ? `For ${recipientName}` : "An apology for you", text, url }); return; }
      await navigator.clipboard.writeText(url);
      flash("Link copied");
    } catch (_) {}
  }

  async function togglePublish() {
    open = false;
    if (busy) return;
    if (isPublic && !confirm("Unpublish this page? It leaves search and the public list.")) return;
    busy = true;
    const { error } = isPublic
      ? await actions.unpublishApology({ slug })
      : await actions.publishApologyPage({ slug });
    busy = false;
    if (error) { flash(error.message || "Something went wrong. Try again."); return; }
    window.location.reload();
  }

  const item = "w-full text-left px-4 py-2.5 text-sm hover:bg-base-200 focus-visible:bg-base-200 outline-none flex items-center gap-2";
</script>

<div class="relative font-sans" bind:this={menu}>
  <button
    type="button"
    class="w-9 h-9 inline-flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-200 aria-expanded:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
    aria-label="Options"
    aria-haspopup="menu"
    aria-expanded={open}
    on:click={() => (open = !open)}
    disabled={busy}
  >
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
    </svg>
  </button>

  {#if open}
    <div role="menu" class="absolute right-0 top-full mt-1 z-30 w-52 bg-base-100 border border-base-300 shadow-lg py-1">
      <a role="menuitem" class={item} href={`/sorry/${slug}`}>Open</a>
      {#if isPublic}
        <div class="border-t border-base-200 my-1"></div>
        <button role="menuitem" type="button" class={item} on:click={share}>{canShare ? "Share…" : "Share (copy link)"}</button>
        <button role="menuitem" type="button" class={item} on:click={copyLink}>Copy link</button>
        <a role="menuitem" class={item} href={`/story/${slug}.png`} download={`apology-${slug}.png`} on:click={() => (open = false)}>Download image</a>
        <div class="border-t border-base-200 my-1"></div>
        <button role="menuitem" type="button" class={`${item} text-error`} on:click={togglePublish}>Unpublish</button>
      {:else}
        <div class="border-t border-base-200 my-1"></div>
        <button role="menuitem" type="button" class={item} on:click={togglePublish}>Publish</button>
      {/if}
    </div>
  {/if}

  {#if note}
    <p class="absolute right-0 top-full mt-1 z-20 whitespace-nowrap text-xs bg-neutral text-neutral-content px-2 py-1" role="status">{note}</p>
  {/if}
</div>
