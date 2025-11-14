<script lang="ts">
  import { onMount } from 'svelte';
  import LetterFilters from './LetterFilters.svelte';

  export let initialLetters: any[] = [];

  let filteredLetters = initialLetters;
  let selectedRecipient = '';
  let selectedTone = '';
  let searchTerm = '';

  // Reactive filtering
  $: {
    filteredLetters = initialLetters.filter(letter => {
      let match = true;

      if (selectedRecipient && letter.recipient !== selectedRecipient) {
        match = false;
      }

      if (selectedTone && letter.tone !== selectedTone) {
        match = false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const contextMatch = letter.context.toLowerCase().includes(searchLower);
        match = match && contextMatch;
      }

      return match;
    });
  }

  function getRecipientIcon(recipient: string): string {
    const icons: Record<string, string> = {
      boss: "👔",
      client: "🤝",
      colleague: "👥",
      daughter: "👧",
      father: "👨",
      friend: "👫",
      husband: "💑",
      mother: "👩",
      romantic: "💕",
      son: "👦",
      teacher: "📚",
      wife: "💑"
    };
    return icons[recipient] || "📝";
  }

  function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
</script>

<div>
  <LetterFilters
    bind:selectedRecipient
    bind:selectedTone
    bind:searchTerm
    totalCount={filteredLetters.length}
  />

  {#if filteredLetters.length === 0}
    <div class="alert alert-info shadow-lg">
      <div class="flex flex-col items-center text-center">
        <svg class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="font-bold text-lg">No letters found</h3>
        <p class="text-sm mt-2">Try adjusting your search criteria.</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredLetters as letter}
        <a
          href={`/examples/${letter.recipient}/${letter.slug}`}
          class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-base-300 hover:border-primary"
        >
          <div class="card-body p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="text-3xl group-hover:scale-110 transition-transform duration-300">
                {getRecipientIcon(letter.recipient)}
              </div>
              <div class="flex flex-col gap-1">
                <div class="badge badge-primary badge-sm">
                  {capitalizeFirst(letter.recipient)}
                </div>
                <div class="badge badge-secondary badge-sm">
                  {capitalizeFirst(letter.tone)}
                </div>
              </div>
            </div>

            <!-- Context -->
            <h3 class="card-title text-base group-hover:text-primary transition-colors line-clamp-2">
              {letter.context}
            </h3>

            <!-- Letter Preview -->
            <p class="text-sm opacity-70 line-clamp-3 mb-4">
              {letter.letters[0]}
            </p>

            <!-- Footer -->
            <div class="card-actions justify-between items-center pt-4 border-t border-base-300">
              <div class="text-xs opacity-60">
                {letter.letters.length} {letter.letters.length === 1 ? 'example' : 'examples'}
              </div>
              <div class="flex items-center gap-2">
                {#if letter.source === 'generated'}
                  <div class="badge badge-success badge-sm gap-1">
                    ✨ AI
                  </div>
                {/if}
                <svg class="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
