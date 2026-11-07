<script lang="ts">
  // Owner-only share block, placed right under the live apology page: the page
  // itself, then the buttons to send it. No bar, no editor — just send.
  import { onMount } from "svelte";

  export let slug: string;
  export let justPublished = false;
  export let openSend = false;
  export let recipientName: string | null = null;
  export let qrSvg = "";

  const name = recipientName?.trim() || "";
  let url = `https://apologify.com/sorry/${slug}`;
  let copied = false;
  let canNativeShare = false;
  let section: HTMLElement;
  let inView = false;

  $: message = `I made something for you 💌 Open it when you have a quiet minute: ${url}`;
  $: enc = encodeURIComponent(message);
  $: channels = [
    { label: "Text message", href: `sms:?&body=${enc}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(name ? `For ${name}` : "Something for you")}&body=${enc}` },
  ];

  onMount(() => {
    url = `${window.location.origin}/sorry/${slug}`;
    canNativeShare = !!navigator.share;
    if (openSend) section?.scrollIntoView({ behavior: "smooth" });
    // Hide the floating "Send it" shortcut once the buttons are on screen.
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.15 });
    io.observe(section);
    return () => io.disconnect();
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (_) {
      prompt("Copy your link", url);
    }
  }

  async function nativeShare() {
    try { await navigator.share({ text: message }); } catch (_) {}
  }

  function downloadQr() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([qrSvg], { type: "image/svg+xml" }));
    a.download = `apology-qr-${slug}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
</script>

{#if !inView}
  <a href="#send" class="sp-jump btn btn-primary btn-sm fixed bottom-4 right-4 z-[60] shadow-lg font-sans">
    Send it ↓
  </a>
{/if}

<section id="send" bind:this={section} class="sp font-sans" aria-labelledby="sp-title">
  <div class="sp-inner">
    <p class="sp-kicker">{justPublished ? "Your page is live" : "Only you see this part"}</p>
    <h2 id="sp-title" class="sp-title">Send it{name ? ` to ${name}` : ""}.</h2>
    <p class="sp-note">The link opens the page above, sealed in an envelope.</p>

    <a href={`https://wa.me/?text=${enc}`} target="_blank" rel="noopener" class="btn btn-primary w-full mt-6">WhatsApp</a>

    <div class="sp-grid">
      {#each channels as c}
        <a href={c.href} class="btn btn-outline">{c.label}</a>
      {/each}
      <button type="button" on:click={copyLink} class="btn btn-outline">{copied ? "Copied!" : "Copy link"}</button>
      {#if canNativeShare}
        <button type="button" on:click={nativeShare} class="btn btn-outline">More apps…</button>
      {/if}
      <a href={`/story/${slug}.png`} download={`apology-${slug}.png`} class="btn btn-outline">Download image</a>
      {#if qrSvg}
        <button type="button" on:click={downloadQr} class="btn btn-outline">Download QR</button>
      {/if}
    </div>
    <p class="sp-hint">The image shows only their name and the title — never your message.</p>

    <nav class="sp-links">
      <a href={`/customize?slug=${slug}`}>Change design</a>
      <span aria-hidden="true">·</span>
      <a href="/dashboard">Your pages</a>
    </nav>
  </div>

  <a href="/" class="sp-brand" aria-label="Apologify home">
    <img src="/seal.svg" alt="" width="44" height="44" />
    <span>
      <strong>Apologify</strong>
      <small>Made with apologify.com</small>
    </span>
  </a>
</section>

<style>
  .sp {
    background: #FAF7F1;
    color: #241F1A;
    border-top: 1px solid rgba(36, 31, 26, 0.15);
    padding: 3.5rem 1rem 2rem;
  }
  .sp-inner { max-width: 28rem; margin: 0 auto; text-align: center; }
  .sp-kicker {
    font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: #C1272D;
  }
  .sp-title {
    font-family: "Spectral", Georgia, serif; font-weight: 300;
    font-size: clamp(1.9rem, 6vw, 2.5rem); line-height: 1.1; margin-top: 0.4rem;
    text-wrap: balance;
  }
  .sp-note { font-size: 0.9rem; color: rgba(36, 31, 26, 0.65); margin-top: 0.5rem; }
  .sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem; }
  .sp-grid :global(.btn) { border-color: rgba(36, 31, 26, 0.25); color: #241F1A; font-weight: 500; }
  .sp-grid :global(.btn:hover) { background: #241F1A; color: #FAF7F1; border-color: #241F1A; }
  .sp-hint { font-size: 0.75rem; color: rgba(36, 31, 26, 0.55); margin-top: 0.75rem; }
  .sp-links { display: flex; justify-content: center; gap: 0.6rem; margin-top: 1.5rem; font-size: 0.85rem; }
  .sp-links a { text-decoration: underline; text-decoration-color: rgba(36, 31, 26, 0.25); text-underline-offset: 3px; }
  .sp-links a:hover { text-decoration-color: #C1272D; }
  .sp-brand {
    display: flex; align-items: center; justify-content: center; gap: 0.75rem;
    max-width: 28rem; margin: 3rem auto 0; padding-top: 1.5rem;
    border-top: 1px solid rgba(36, 31, 26, 0.12);
  }
  .sp-brand span { display: flex; flex-direction: column; text-align: left; line-height: 1.15; }
  .sp-brand strong { font-family: "Spectral", Georgia, serif; font-weight: 500; font-size: 1.35rem; }
  .sp-brand small { font-size: 0.75rem; color: rgba(36, 31, 26, 0.6); }
  @media (prefers-reduced-motion: reduce) { :global(html) { scroll-behavior: auto; } }
</style>
