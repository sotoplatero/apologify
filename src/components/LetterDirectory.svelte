<script lang="ts">
  export let initialLetters: any[] = [];

  $: filteredLetters = (initialLetters || []).filter(Boolean);
</script>

<div>
  {#if filteredLetters.length === 0}
    <div class="empty">
      <h3>No letters found</h3>
      <p>Try adjusting your search criteria.</p>
    </div>
  {:else}
    <div class="letters">
      {#each filteredLetters as letter}
        {#if letter}
          <a href={`/examples/${letter.recipient}/${letter.slug}`} class="letter">
            <p class="meta">
              {[letter.tone, 'to a ' + letter.recipient, letter.source === 'generated' ? 'written with AI' : ''].filter(Boolean).join(' · ')}
            </p>
            <h3 class="title">{letter.title || letter.context}</h3>
            <p class="text">{letter.letters?.[0] || ''}</p>
            <p class="foot">
              {letter.letters?.length || 0} {(letter.letters?.length || 0) === 1 ? 'example' : 'examples'}
            </p>
          </a>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .letters {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 clamp(1.5rem, 3vw, 3rem);
  }
  .letter {
    display: flex;
    flex-direction: column;
    padding: 1.5rem 0 2.25rem;
    border-top: 1px solid #e0d8c8;
  }
  .meta,
  .foot {
    margin: 0;
    font-family: 'Jost', system-ui, sans-serif;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #6b6157;
  }
  .title {
    margin: 0.8rem 0 0;
    font-family: 'Spectral', Georgia, serif;
    font-size: 1.4rem;
    font-weight: 400;
    line-height: 1.18;
    letter-spacing: -0.015em;
    color: #241f1a;
    text-wrap: balance;
    transition: color 0.2s;
  }
  .letter:hover .title { color: #c1272d; }
  .text {
    margin: 0.9rem 0 1.25rem;
    font-family: 'Spectral', Georgia, serif;
    font-style: italic;
    font-size: 1rem;
    line-height: 1.6;
    color: #3a332c;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .foot { margin-top: auto; }
  .empty { padding: 3rem 0; border-top: 1px solid #e0d8c8; text-align: center; }
  .empty h3 { margin: 0; font-family: 'Spectral', Georgia, serif; font-size: 1.6rem; font-weight: 400; }
  .empty p { margin: 0.5rem 0 0; font-family: 'Jost', system-ui, sans-serif; color: #6b6157; }

  @media (max-width: 1024px) { .letters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .letters { grid-template-columns: 1fr; } }
</style>
