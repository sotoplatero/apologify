<script lang="ts">
  import { actions } from "astro:actions";
  import { tones, contextsByRecipient } from "../lib/apologyData.js";
  import Letter from "./Letter.svelte";

  export let recipient: string;
  export let defaultTone: string;

  $: contexts =
    contextsByRecipient[recipient as keyof typeof contextsByRecipient] || [];

  let selectedTone = defaultTone;
  let context = "";
  let isGenerating = false;
  let generatedLetter = "";
  let error = "";

  async function generateLetter() {
    if (!context.trim() || !selectedTone) {
      error = "Please describe your situation and select a tone.";
      return;
    }

    isGenerating = true;
    error = "";

    try {
      const formData = new FormData();
      formData.append("relationship", recipient);
      formData.append("context", context);
      formData.append("tone", selectedTone);

      const { data, error: actionError } = await actions.createLetter(formData);

      if (actionError) {
        error = actionError.message;
      } else if (data) {
        generatedLetter = data.letter;
      }
    } catch (err) {
      error = "Failed to generate letter. Please try again.";
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  function startOver() {
    generatedLetter = "";
    context = "";
    selectedTone = defaultTone;
    error = "";
  }
</script>

{#if !generatedLetter}
  <!-- Generator Form -->
  <div
    class="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8"
  >
    <form on:submit|preventDefault={generateLetter}>
      <!-- Situation -->
      <div class="mb-5">
        <div class="flex items-baseline justify-between mb-2">
          <label for="context-input" class="font-semibold text-gray-900"
            >What happened?</label
          >
          <span class="text-xs text-gray-400 tabular-nums"
            >{context.length}/500</span
          >
        </div>
        <textarea
          id="context-input"
          bind:value={context}
          placeholder="Describe what happened and why you need to apologize..."
          class="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
          maxlength="500"
          name="context"
          autocomplete="off"
        ></textarea>
      </div>

      <!-- Tone -->
      <div class="mb-6">
        <label for="tone-select" class="font-semibold text-gray-900 block mb-2"
          >Tone</label
        >
        <select
          id="tone-select"
          bind:value={selectedTone}
          class="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow appearance-none"
          name="tone"
        >
          {#each tones as tone (tone.value)}
            <option value={tone.value}>{tone.emoji} {tone.label}</option>
          {/each}
        </select>
      </div>

      <!-- Error Message -->
      {#if error}
        <div
          class="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700"
          role="alert"
        >
          <svg
            class="w-5 h-5 mt-0.5 flex-shrink-0"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm">{error}</span>
        </div>
      {/if}

      <!-- Generate Button -->
      <button
        type="submit"
        disabled={isGenerating || !context.trim() || !selectedTone}
        class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white text-lg font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      >
        {#if isGenerating}
          <svg
            class="w-5 h-5 animate-spin"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Generating Your Letter...</span>
        {:else}
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Generate My Apology Letter</span>
        {/if}
      </button>
    </form>
  </div>
{:else}
  <!-- Generated Letter -->
  <div class="max-w-4xl mx-auto">
    <Letter letter={generatedLetter} />

    <div class="text-center mt-8">
      <button
        on:click={startOver}
        class="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-purple-700 border-2 border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      >
        Generate Another Letter
      </button>
    </div>
  </div>
{/if}
