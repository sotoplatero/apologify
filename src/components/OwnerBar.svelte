<script lang="ts">
  // Owner-only bar on top of a live apology page. Its main job is getting the
  // page to the recipient: a "Send it" panel with a ready-made teaser message,
  // one-tap chat apps, the owner's own email app, a QR code and a story image.
  import { onMount } from "svelte";
  import { shareStoryImage } from "../lib/shareStory";

  export let slug: string;
  export let justPublished = false;
  export let openSend = false;
  export let recipientName: string | null = null;
  export let qrSvg = "";

  let url = `https://apologify.com/sorry/${slug}`;
  let open = justPublished || openSend;
  let copied = "";
  let storyState = "";

  const name = recipientName?.trim() || "";
  let message = `I made something for you 💌 Open it when you have a quiet minute: ${url}`;

  onMount(() => {
    url = `${window.location.origin}/sorry/${slug}`;
    message = message.replace(/https?:\/\/\S+$/, url);
  });

  $: enc = encodeURIComponent(message);
  $: channels = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc}`, primary: true },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message.replace(url, "").trim())}` },
    { label: "Text message", href: `sms:?&body=${enc}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(name ? `For ${name}` : "Something for you")}&body=${enc}` },
  ];

  async function copy(what: "link" | "message") {
    const text = what === "link" ? url : message;
    try {
      await navigator.clipboard.writeText(text);
      copied = what;
      setTimeout(() => (copied = ""), 2000);
    } catch (_) {
      (document.getElementById("owner-url") as HTMLInputElement | null)?.select();
    }
  }

  async function nativeShare() {
    try { await navigator.share({ text: message }); } catch (_) {}
  }

  async function story() {
    storyState = "Preparing…";
    const result = await shareStoryImage(slug, url);
    storyState = result === "downloaded" ? "Saved — post it to your story" : "";
  }

  function downloadQr() {
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `apology-qr-${slug}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  let canNativeShare = false;
  onMount(() => (canNativeShare = typeof navigator !== "undefined" && !!navigator.share));
</script>

<div class="fixed top-0 inset-x-0 z-[60] bg-neutral text-neutral-content font-sans shadow-lg">
  <div class="max-w-4xl mx-auto px-3 py-2 flex items-center gap-2 sm:gap-3">
    <span class="shrink-0 text-sm font-medium hidden sm:inline">
      {justPublished ? "Your page is live" : "Your page"}
    </span>
    <input
      id="owner-url"
      type="text"
      readonly
      value={url}
      aria-label="Your page link"
      class="flex-1 min-w-0 bg-neutral-content/10 rounded px-2 py-1 text-xs text-neutral-content/90 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      on:focus={(e) => (e.currentTarget as HTMLInputElement).select()}
    />
    <button type="button" on:click={() => (open = !open)} aria-expanded={open} aria-controls="send-panel" class="btn btn-xs btn-primary shrink-0">
      {open ? "Close" : "Send it"}
    </button>
    <a href={`/customize?slug=${slug}`} class="btn btn-xs btn-ghost text-neutral-content shrink-0 hidden sm:inline-flex">Change design</a>
    <a href="/dashboard" class="btn btn-xs btn-ghost text-neutral-content shrink-0">Dashboard</a>
  </div>

  {#if open}
    <section id="send-panel" class="border-t border-neutral-content/10 max-h-[80vh] overflow-y-auto overscroll-contain">
      <div class="max-w-4xl mx-auto px-4 py-5 sm:py-6 grid gap-6 sm:grid-cols-[1fr_auto]">
        <div class="min-w-0">
          <h2 class="font-display text-xl sm:text-2xl text-neutral-content" style="text-wrap: balance;">
            {justPublished ? "It's live. Now send it" : "Send it"}{name ? ` to ${name}` : ""}.
          </h2>
          <p class="text-sm text-neutral-content/70 mt-1">A short, curious message gets opened more than the bare link. Edit it if you like.</p>

          <label class="block mt-4">
            <span class="sr-only">Message to send with your link</span>
            <textarea
              bind:value={message}
              rows="3"
              class="w-full rounded-lg bg-neutral-content/10 text-neutral-content text-sm p-3 leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            ></textarea>
          </label>

          <div class="mt-3 flex flex-wrap gap-2">
            {#each channels as c}
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener"
                class={c.primary ? "btn btn-sm btn-primary" : "btn btn-sm btn-outline border-neutral-content/30 text-neutral-content hover:bg-neutral-content hover:text-neutral"}
              >{c.label}</a>
            {/each}
            <button type="button" on:click={() => copy("message")} class="btn btn-sm btn-ghost text-neutral-content">
              {copied === "message" ? "Copied!" : "Copy message"}
            </button>
            <button type="button" on:click={() => copy("link")} class="btn btn-sm btn-ghost text-neutral-content">
              {copied === "link" ? "Copied!" : "Copy link"}
            </button>
            {#if canNativeShare}
              <button type="button" on:click={nativeShare} class="btn btn-sm btn-ghost text-neutral-content">More…</button>
            {/if}
          </div>

          <div class="mt-5 pt-5 border-t border-neutral-content/10 flex flex-wrap items-center gap-3">
            <button type="button" on:click={story} class="btn btn-sm btn-outline border-neutral-content/30 text-neutral-content hover:bg-neutral-content hover:text-neutral">
              Post a teaser to your story
            </button>
            <span class="text-xs text-neutral-content/60" aria-live="polite">{storyState || "Shows only their name and the title — never your message."}</span>
          </div>
        </div>

        {#if qrSvg}
          <figure class="flex sm:flex-col items-center gap-3 sm:w-44">
            <div class="bg-[#F5F1E8] rounded-lg p-2 w-28 sm:w-full shrink-0 [&>svg]:w-full [&>svg]:h-auto">
              {@html qrSvg}
            </div>
            <figcaption class="text-xs text-neutral-content/70 leading-snug sm:text-center">
              Print it, or tuck it into flowers or a handwritten card.
              <button type="button" on:click={downloadQr} class="link link-hover text-neutral-content block mt-1">Download QR</button>
            </figcaption>
          </figure>
        {/if}
      </div>
    </section>
  {/if}
</div>
