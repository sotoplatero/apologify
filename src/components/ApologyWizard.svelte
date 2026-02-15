<script lang="ts">
  import { actions } from 'astro:actions';
  import { onMount } from 'svelte';
  import { tones, personalRecipients, professionalRecipients } from '../lib/apologyData.js';

  const placeholder = `Describe the situation that requires an apology...`;
  const MIN_CONTEXT_LENGTH = 20;

  export let initialType: 'personal' | 'professional' = 'personal';

  let currentStep = 1;
  const totalSteps = 4;

  let letterType: 'personal' | 'professional' = 'personal';
  let relationship = '';
  let selectedTone = tones[0]?.value || 'formal';
  let context = '';
  let loading = false;
  let isTransitioning = false;

  let textareaElement: HTMLTextAreaElement;
  let formElement: HTMLFormElement;

  $: if (initialType) {
    letterType = initialType;
  }

  $: progressWidth = `${(currentStep / totalSteps) * 100}%`;
  $: availableRecipients = letterType === 'personal' ? personalRecipients : professionalRecipients;
  $: normalizedContext = (() => {
    let r = context.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').replace(/[^\w\s.,!?;:'"()\-\u00C0-\u024F]/g, '').replace(/\s+/g, ' ').trim();
    const letters = r.replace(/[^a-zA-Z\u00C0-\u024F]/g, '');
    if (letters.length > 0 && letters === letters.toUpperCase()) r = r.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z\u00E0-\u024F])/g, (_, sep, ch) => sep + ch.toUpperCase());
    return r;
  })();
  $: contextLength = normalizedContext.length;

  // Reset relationship when switching letter type
  $: if (letterType) {
    relationship = '';
  }

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (loading || isTransitioning) return;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (currentStep === 4 && document.activeElement === textareaElement) {
            if (e.ctrlKey || e.metaKey) {
              handleNext();
            }
          } else {
            handleNext();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  function validateStep(step: number): boolean {
    switch(step) {
      case 1:
        return !!letterType;
      case 2:
        return !!relationship;
      case 3:
        return !!selectedTone;
      case 4:
        return contextLength >= MIN_CONTEXT_LENGTH;
      default:
        return false;
    }
  }

  function handlePrevious() {
    if (currentStep > 1 && !isTransitioning) {
      isTransitioning = true;
      setTimeout(() => {
        currentStep--;
        isTransitioning = false;
      }, 150);
    }
  }

  function handleNext() {
    if (validateStep(currentStep) && !isTransitioning) {
      if (currentStep < totalSteps) {
        isTransitioning = true;
        setTimeout(() => {
          currentStep++;
          isTransitioning = false;
          if (currentStep === 4) {
            setTimeout(() => textareaElement?.focus(), 100);
          }
        }, 150);
      } else {
        handleSubmit();
      }
    }
  }

  function handleSubmit() {
    if (!validateStep(currentStep)) {
      return;
    }

    loading = true;

    if (formElement) {
      formElement.submit();
    }
  }

  function selectLetterType(value: 'personal' | 'professional') {
    letterType = value;
    setTimeout(() => handleNext(), 300);
  }

  function selectRelationship(value: string) {
    relationship = value;
    setTimeout(() => handleNext(), 300);
  }

  function selectTone(value: string) {
    selectedTone = value;
    setTimeout(() => handleNext(), 300);
  }
</script>

<div class="">

  <!-- Barra de progreso -->
  <div class="fixed top-0 left-0 right-0 z-50">
    <div class="h-1 bg-gray-200">
      <div
        class="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
        style="width: {progressWidth}"
      ></div>
    </div>
  </div>

  <div class="flex flex-col justify-center py-16">
    <div class="w-full max-w-2xl mx-auto">

      <div id="write-letter">

        <!-- Loading State -->
        {#if loading}
          <div class="fixed inset-0 bg-white flex items-center justify-center z-50">
            <div class="text-center space-y-8">
              <div class="w-20 h-20 mx-auto">
                <div class="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                Creating your letter...
              </h1>
              <p class="text-xl text-gray-600">
                This will just take a moment
              </p>
            </div>
          </div>
        {:else}

        <!-- Step 1: Letter Type -->
        {#if currentStep === 1}
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="space-y-4 text-center">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                What type of apology?
              </h1>
              <p class="text-xl text-gray-600">
                Choose the category that best fits your situation
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 max-w-lg mx-auto">
              <button
                type="button"
                on:click={() => selectLetterType('personal')}
                class="flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all duration-200 {letterType === 'personal' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}"
              >
                <span class="flex-shrink-0 w-10 h-10 rounded border-2 flex items-center justify-center text-sm font-bold {letterType === 'personal' ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-400 bg-white text-gray-600'}">
                  A
                </span>
                <span class="text-xl font-semibold text-gray-800">Personal</span>
                <span class="text-sm text-gray-500 text-center">Family, friends, partners</span>
              </button>
              <button
                type="button"
                on:click={() => selectLetterType('professional')}
                class="flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all duration-200 {letterType === 'professional' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}"
              >
                <span class="flex-shrink-0 w-10 h-10 rounded border-2 flex items-center justify-center text-sm font-bold {letterType === 'professional' ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-400 bg-white text-gray-600'}">
                  B
                </span>
                <span class="text-xl font-semibold text-gray-800">Professional</span>
                <span class="text-sm text-gray-500 text-center">Boss, colleagues, clients</span>
              </button>
            </div>
          </div>
        {/if}

        <!-- Step 2: Recipient -->
        {#if currentStep === 2}
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="space-y-4 text-center">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                Who are you apologizing to?
              </h1>
              <p class="text-xl text-gray-600">
                Select the recipient of your apology
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {#each availableRecipients as recipient, index}
                <button
                  type="button"
                  on:click={() => selectRelationship(recipient.value)}
                  class="flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 text-left {relationship === recipient.value ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}"
                >
                  <span class="flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold {relationship === recipient.value ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-400 bg-white text-gray-600'}">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div class="flex-1 min-w-0">
                    <span class="text-lg font-medium text-gray-800 block truncate">{recipient.label}</span>
                  </div>
                  {#if relationship === recipient.value}
                    <svg class="w-5 h-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Step 3: Tone -->
        {#if currentStep === 3}
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="space-y-4 text-center">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                What tone should we use?
              </h1>
              <p class="text-xl text-gray-600">
                Choose the style that feels right for your situation
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-12">
              {#each tones as tone, index}
                <button
                  type="button"
                  on:click={() => selectTone(tone.value)}
                  class="flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 text-left {selectedTone === tone.value ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}"
                >
                  <span class="flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold {selectedTone === tone.value ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-400 bg-white text-gray-600'}">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div class="flex-1 min-w-0">
                    <span class="text-lg font-medium text-gray-800 block truncate">{tone.label}</span>
                  </div>
                  {#if selectedTone === tone.value}
                    <svg class="w-5 h-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Step 4: Context (Final Step) -->
        {#if currentStep === 4}
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="space-y-4 text-center">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                What happened?
              </h1>
              <p class="text-xl text-gray-600">
                Describe the situation that requires an apology
              </p>
            </div>

            <div class="mt-12">
              <textarea
                bind:this={textareaElement}
                bind:value={context}
                name="context"
                rows="6"
                class="w-full text-xl bg-transparent border-2 border-gray-300 focus:border-purple-500 outline-none text-gray-800 placeholder-gray-400 transition-colors p-4 rounded-lg resize-none"
                placeholder={placeholder}
                required
              ></textarea>
              <div class="flex justify-end mt-2">
                <span class="text-sm {contextLength >= MIN_CONTEXT_LENGTH ? 'text-green-600' : 'text-gray-400'}">
                  {contextLength}/{MIN_CONTEXT_LENGTH} min characters
                </span>
              </div>
            </div>
          </div>
        {/if}

        <!-- Botones de navegación -->
        <div class="mt-16 pt-8">
          <div class="flex justify-between items-center">
            <button
              type="button"
              on:click={handlePrevious}
              disabled={currentStep === 1}
              class="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="font-medium">Previous</span>
            </button>

            {#if currentStep === totalSteps}
              <button
                type="button"
                on:click={handleSubmit}
                disabled={!validateStep(currentStep)}
                class="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <span>Generate Letter</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            {:else}
              <button
                type="button"
                on:click={handleNext}
                disabled={!validateStep(currentStep)}
                class="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <span>Next</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {/if}
          </div>
        </div>

        {/if}

      </div>

      <form bind:this={formElement} action={actions.createLetter} method="POST" style="display: none;">
        <input type="hidden" name="relationship" value={relationship} />
        <input type="hidden" name="context" value={context} />
        <input type="hidden" name="tone" value={selectedTone} />
      </form>
    </div>
  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-in-from-bottom-4 {
    from { transform: translateY(1rem); }
    to { transform: translateY(0); }
  }

  .animate-in {
    animation: fade-in 0.5s ease-out, slide-in-from-bottom-4 0.5s ease-out;
  }
</style>
