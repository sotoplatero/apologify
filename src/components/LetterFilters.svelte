<script lang="ts">
  import { recipients, tones } from '../lib/apologyData.js';

  export let selectedRecipient: string = '';
  export let selectedTone: string = '';
  export let searchTerm: string = '';
  export let totalCount: number = 0;

  function handleRecipientChange(e: Event) {
    selectedRecipient = (e.target as HTMLSelectElement).value;
  }

  function handleToneChange(e: Event) {
    selectedTone = (e.target as HTMLSelectElement).value;
  }

  function handleSearchInput(e: Event) {
    searchTerm = (e.target as HTMLInputElement).value;
  }

  function clearFilters() {
    selectedRecipient = '';
    selectedTone = '';
    searchTerm = '';
  }

  $: hasFilters = selectedRecipient || selectedTone || searchTerm;
</script>

<div class="card bg-base-100 shadow-xl border border-base-300 mb-8">
  <div class="card-body">
    <div class="flex flex-col md:flex-row gap-4 mb-4">
      <!-- Search Input -->
      <div class="form-control flex-1">
        <label class="label" for="search">
          <span class="label-text font-medium">Search</span>
        </label>
        <input
          id="search"
          type="text"
          bind:value={searchTerm}
          on:input={handleSearchInput}
          placeholder="Search by situation or keywords..."
          class="input input-bordered w-full"
        />
      </div>

      <!-- Recipient Filter -->
      <div class="form-control flex-1">
        <label class="label" for="recipient">
          <span class="label-text font-medium">Recipient</span>
        </label>
        <select
          id="recipient"
          bind:value={selectedRecipient}
          on:change={handleRecipientChange}
          class="select select-bordered w-full"
        >
          <option value="">All Recipients</option>
          {#each recipients as recipient}
            <option value={recipient.value}>{recipient.label}</option>
          {/each}
        </select>
      </div>

      <!-- Tone Filter -->
      <div class="form-control flex-1">
        <label class="label" for="tone">
          <span class="label-text font-medium">Tone</span>
        </label>
        <select
          id="tone"
          bind:value={selectedTone}
          on:change={handleToneChange}
          class="select select-bordered w-full"
        >
          <option value="">All Tones</option>
          {#each tones as tone}
            <option value={tone.value}>{tone.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Filter Summary -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
      <div class="flex items-center gap-2">
        <span class="opacity-70">Showing</span>
        <span class="badge badge-primary">{totalCount}</span>
        <span class="opacity-70">{totalCount === 1 ? 'letter' : 'letters'}</span>
        {#if hasFilters}
          <button
            on:click={clearFilters}
            class="btn btn-ghost btn-xs"
          >
            Clear filters
          </button>
        {/if}
      </div>

      {#if hasFilters}
        <div class="flex flex-wrap gap-2">
          {#if selectedRecipient}
            <div class="badge badge-primary gap-2">
              {recipients.find(r => r.value === selectedRecipient)?.label}
              <button
                on:click={() => selectedRecipient = ''}
                class="hover:opacity-70"
              >
                ✕
              </button>
            </div>
          {/if}
          {#if selectedTone}
            <div class="badge badge-secondary gap-2">
              {tones.find(t => t.value === selectedTone)?.label}
              <button
                on:click={() => selectedTone = ''}
                class="hover:opacity-70"
              >
                ✕
              </button>
            </div>
          {/if}
          {#if searchTerm}
            <div class="badge badge-accent gap-2">
              "{searchTerm}"
              <button
                on:click={() => searchTerm = ''}
                class="hover:opacity-70"
              >
                ✕
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
