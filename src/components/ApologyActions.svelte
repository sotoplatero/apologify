<script lang="ts">
  import { actions } from "astro:actions";
  import { onMount } from "svelte";
  import { shareStoryImage } from "../lib/shareStory";

  export let slug: string;
  // Legacy prop, still passed by templates; absorbed so there's no unknown-prop warning.
  export let acceptedAt: string | null = null;
  export let preview = false;
  export let acceptLabel = "Like this 💛";
  // Template-provided styling so the buttons match each design.
  export let primaryClass = "";
  export let secondaryClass = "";
  export let mutedClass = "";

  // The recipient's path: a heart tap (like) → an answer for the sender
  // ("I forgive you" / "I need time") → share the moment, or make their own.
  // localStorage remembers this browser's like + answer between visits.
  let likeCount = 0;
  let liked = false;
  let response: "forgiven" | "not_yet" | null = null;
  let senderName = "";
  let busy = false;
  let copied = false;
  let storyState = "";

  const likedKey = `apologify_liked_${slug}`;
  const responseKey = `apologify_response_${slug}`;

  onMount(async () => {
    if (preview) return;
    try {
      liked = localStorage.getItem(likedKey) === "1";
      const saved = localStorage.getItem(responseKey);
      if (saved === "forgiven" || saved === "not_yet") response = saved;
    } catch (_) {}
    try {
      const { data } = await actions.getApologyLikes({ slug });
      if (data) {
        likeCount = data.likes;
        senderName = data.senderName?.trim() || "";
      }
    } catch (_) {}
  });

  $: them = senderName || "them";

  async function like() {
    if (busy || liked) return;
    busy = true;
    liked = true; likeCount += 1; // optimistic
    try { localStorage.setItem(likedKey, "1"); } catch (_) {}
    try {
      const { data } = await actions.likeApology({ slug });
      if (data) likeCount = data.likes;
    } catch (_) { /* keep optimistic count */ }
    finally { busy = false; }
    // Designs whose heart button already says "I forgive you" count it as the answer.
    if (/forgive/i.test(acceptLabel)) await respond("forgiven");
  }

  async function respond(value: "forgiven" | "not_yet") {
    if (busy) return;
    busy = true;
    response = value; // optimistic
    try { localStorage.setItem(responseKey, value); } catch (_) {}
    try { await actions.respondToApology({ slug, response: value }); } catch (_) {}
    finally { busy = false; }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
    const data = { title: "An apology for you", text: "I wrote you something 💛", url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(url);
      copied = true; setTimeout(() => (copied = false), 2000);
    } catch (_) {}
  }

  async function story() {
    storyState = "Preparing…";
    const result = await shareStoryImage(slug, "");
    storyState = result === "downloaded" ? "Saved — post it to your story" : "";
  }
</script>

{#if preview}
  <p class={mutedClass}>Your recipient can like this and answer you 💛</p>
{:else if !liked}
  <div class="flex flex-wrap items-center justify-center gap-3">
    <button on:click={like} disabled={busy} class={primaryClass}>
      {`${acceptLabel}${likeCount > 0 ? ` · ${likeCount}` : ""}`}
    </button>
    <button on:click={share} class={secondaryClass}>{copied ? "Link copied!" : "Share"}</button>
  </div>
{:else if !response}
  <div class="flex flex-col items-center gap-3 text-center" aria-live="polite">
    <p class={mutedClass}>{senderName ? `Want to tell ${senderName} how you feel?` : "Want to answer?"}</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button on:click={() => respond("forgiven")} disabled={busy} class={primaryClass}>I forgive you ❤️</button>
      <button on:click={() => respond("not_yet")} disabled={busy} class={secondaryClass}>I need some time</button>
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center gap-3 text-center" aria-live="polite">
    <p class={mutedClass}>
      {response === "forgiven"
        ? `You forgave ${them}. They'll know. ❤️`
        : `That's okay. ${senderName || "They"}'ll know you read it — take the time you need.`}
    </p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#if response === "forgiven"}
        <button on:click={story} class={secondaryClass}>Share to your story</button>
      {/if}
      <a href="/generator" class={secondaryClass}>Make your own apology</a>
    </div>
    {#if storyState}<p class={mutedClass}>{storyState}</p>{/if}
  </div>
{/if}
