<script module lang="ts">
  type Tally = { avg: number; count: number };
  type IssueVotes = { signedIn: boolean; tallies: Record<string, Tally>; mine: Record<string, number> };

  // One request per issue page, shared by every case's vote widget (a plain,
  // non-reactive cache on purpose).
  const cache = new Map<string, Promise<IssueVotes>>();
  function loadVotes(issue: string): Promise<IssueVotes> {
    if (!cache.has(issue)) {
      cache.set(
        issue,
        fetch(`/api/news/votes?issue=${encodeURIComponent(issue)}`, { credentials: 'same-origin' })
          .then((r) => (r.ok ? r.json() : { signedIn: false, tallies: {}, mine: {} }))
          .catch(() => ({ signedIn: false, tallies: {}, mine: {} })),
      );
    }
    return cache.get(issue)!;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  let { issue, item, who }: { issue: string; item: string; who: string } = $props();

  let loaded = $state(false);
  let signedIn = $state(false);
  let tally = $state<Tally | null>(null);
  let mine = $state<number | null>(null);
  let saving = $state(false);
  let error = $state('');

  onMount(() => {
    loadVotes(issue).then((v) => {
      signedIn = v.signedIn;
      tally = v.tallies[item] ?? null;
      mine = v.mine[item] ?? null;
      loaded = true;
    });
  });

  const scores = Array.from({ length: 6 }, (_, i) => i);

  function signInUrl() {
    return `/sign-in?redirect_url=${encodeURIComponent(`${location.pathname}#${item}`)}`;
  }

  async function vote(score: number) {
    if (!signedIn) {
      location.href = signInUrl();
      return;
    }
    saving = true;
    error = '';
    const previous = mine;
    mine = score;
    try {
      const res = await fetch('/api/news/votes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, item, score }),
      });
      const data = await res.json();
      if (res.status === 401) {
        location.href = signInUrl();
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not save your vote.');
      tally = data.tally;
    } catch (e) {
      mine = previous;
      error = e instanceof Error ? e.message : 'Could not save your vote.';
    } finally {
      saving = false;
    }
  }

  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
</script>

<div class="vote" aria-busy={!loaded || saving}>
  <p class="vote-q">{mine === null ? 'Your score' : 'Your score, saved'}</p>
  <div class="scale" role="group" aria-label={`Score ${who}'s apology from 0 to 5`}>
    {#each scores as n (n)}
      <button
        type="button"
        class={{ picked: mine === n }}
        aria-pressed={mine === n}
        disabled={saving}
        onclick={() => vote(n)}>{n}</button
      >
    {/each}
  </div>
  <p class="vote-meta">
    {#if tally && tally.count > 0}
      Readers <strong>{fmt(tally.avg)}</strong> · {tally.count} {tally.count === 1 ? 'vote' : 'votes'}
    {:else if loaded}
      No reader votes yet.
    {/if}
    {#if loaded && !signedIn}
      <a href="/sign-in" onclick={(e) => { e.preventDefault(); location.href = signInUrl(); }}>Sign in to vote</a>
    {/if}
  </p>
  {#if error}<p class="vote-error" role="alert">{error}</p>{/if}
</div>

<style>
  .vote { margin: 0.5rem 0 0; padding-top: 1.25rem; border-top: 1px solid var(--an-rule); font-family: var(--an-sans); }
  .vote-q { margin: 0 0 0.5rem; font-size: 0.66rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--an-ink); }
  .scale { display: flex; flex-wrap: wrap; margin-left: -0.55rem; }
  .scale button {
    position: relative;
    min-width: 2.35rem;
    height: 2.75rem;
    padding: 0 0.55rem;
    border: 0;
    background: none;
    color: var(--an-mute);
    font-family: var(--an-display);
    font-size: 1.3rem;
    font-variant-numeric: lining-nums;
    cursor: pointer;
    transition: color 0.2s;
  }
  .scale button::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0.35rem;
    width: 1.1rem;
    height: 1px;
    background: currentColor;
    transform: translateX(-50%) scaleX(0);
    transition: transform 0.35s var(--an-ease, ease-out);
  }
  .scale button:hover:not(:disabled) { color: var(--an-ink); }
  .scale button:hover:not(:disabled)::after { transform: translateX(-50%) scaleX(1); }
  .scale button.picked { color: var(--an-accent); font-style: italic; }
  .scale button.picked::after { height: 2px; transform: translateX(-50%) scaleX(1); }
  .scale button:disabled { cursor: progress; }
  .vote-meta { display: flex; flex-wrap: wrap; gap: 0.25rem 1.25rem; margin: 0.4rem 0 0; font-size: 0.85rem; font-weight: 400; color: var(--an-mute); min-height: 1.3rem; }
  .vote-meta strong { font-weight: 500; color: var(--an-ink); }
  .vote-meta a { color: var(--an-ink); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 0.22em; }
  .vote-error { margin: 0.3rem 0 0; font-size: 0.85rem; color: #8c1c24; }
  @media (max-width: 400px) {
    .scale button { min-width: 2rem; padding: 0 0.4rem; font-size: 1.15rem; }
  }
</style>
