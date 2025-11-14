<script lang="ts">
  import { actions } from 'astro:actions';
  import { tones, contextsByRecipient } from '../lib/apologyData.js';
  import Letter from './Letter.svelte';

  export let recipient: string;
  export let defaultTone: string;

  $: contexts = contextsByRecipient[recipient as keyof typeof contextsByRecipient] || [];

  let selectedTone = defaultTone;
  let context = '';
  let isGenerating = false;
  let generatedLetter = '';
  let error = '';

  async function generateLetter() {
    if (!context.trim() || !selectedTone) {
      error = 'Please describe your situation and select a tone';
      return;
    }

    isGenerating = true;
    error = '';

    try {
      const formData = new FormData();
      formData.append('relationship', recipient);
      formData.append('context', context);
      formData.append('tone', selectedTone);

      const { data, error: actionError } = await actions.createLetter(formData);

      if (actionError) {
        error = actionError.message;
      } else if (data) {
        generatedLetter = data.letter;
      }
    } catch (err) {
      error = 'Failed to generate letter. Please try again.';
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  function startOver() {
    generatedLetter = '';
    context = '';
    selectedTone = defaultTone;
    error = '';
  }
</script>

{#if !generatedLetter}
  <!-- Generator Form -->
  <div class="card bg-base-100 shadow border-2 max-w-3xl mx-auto">
    <div class="card-body p-6 md:p-8">
        <!-- Situation -->
        <div class="form-control mb-4">
          <label class="label ">
            <span class="label-text font-semibold">What happened?</span>
            <span class="label-text-alt">{context.length}/500 characters</span>
          </label>
          <textarea
            bind:value={context}
            placeholder="Describe what happened and why you need to apologize..."
            class="textarea textarea-bordered h-32"
            maxlength="500"
          ></textarea>
          <!-- Quick examples -->
          <div class="flex flex-wrap gap-2">
            <span class="">💡</span>
            {#each contexts.slice(0, 6) as ctx}
              <button
                type="button"
                on:click={() => context = ctx.text}
                class="link link-primary text-xs hover:underline"
              >
                {ctx.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Tone -->
        <div class="form-control mb-6">
          <select bind:value={selectedTone} class="select select-bordered w-full">
            {#each tones as tone}
              <option value={tone.value}>{tone.emoji} {tone.label} Tone</option>
            {/each}
          </select>
        </div>


        <!-- Error Message -->
        {#if error}
          <div class="alert alert-error mb-6">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        {/if}

        <!-- Generate Button -->
        <button
          on:click={generateLetter}
          disabled={isGenerating || !context.trim() || !selectedTone}
          class="btn btn-primary btn-lg w-full gap-2"
        >
          {#if isGenerating}
            <span class="loading loading-spinner"></span>
            <span class="hidden sm:inline">Generating Your Letter...</span>
            <span class="sm:hidden">Generating...</span>
          {:else}
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="hidden sm:inline">Generate My Apology Letter</span>
            <span class="sm:hidden">Generate Letter</span>
          {/if}
        </button>
      </div>
    </div>
{:else}
  <!-- Generated Letter -->
  <div class="max-w-4xl mx-auto">
    <Letter letter={generatedLetter} />

    <div class="text-center mt-8">
      <button on:click={startOver} class="btn btn-outline btn-primary">
        Generate Another Letter
      </button>
    </div>
  </div>
{/if}
