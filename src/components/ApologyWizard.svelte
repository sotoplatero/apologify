<script lang="ts">
  import { actions } from 'astro:actions';
  import { onMount } from 'svelte';

  type Recipient = {
    value: string;
    label: string;
    description?: string;
  };

  const tones = [
    { value: 'formal', label: 'Formal', description: 'Respectful and structured.' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and friendly.' },
    { value: 'heartfelt', label: 'Heartfelt', description: 'Genuine and emotional.' },
    { value: 'professional', label: 'Professional', description: 'Polished and tactful.' },
    { value: 'remorseful', label: 'Remorseful', description: 'Deeply regretful.' },
    { value: 'humorous', label: 'Humorous', description: 'Light and witty.' },
    { value: 'emotional', label: 'Emotional', description: 'Emotional and heartfelt.' },
    { value: 'apologetic', label: 'Apologetic', description: 'Apologetic and sincere.' },
    { value: 'other', label: 'Other', description: 'Custom tone' },
  ];

  const personalRecipients: Recipient[] = [
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'wife', label: 'Wife' },
    { value: 'husband', label: 'Husband' },
    { value: 'friend', label: 'Friend' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'other', label: 'Other'}
  ];

  const professionalRecipients: Recipient[] = [
    { value: 'manager', label: 'Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'partner', label: 'Business Partner' },
    { value: 'client', label: 'Client' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'hr', label: 'HR' },
    { value: 'vendor', label: 'Vendor/Supplier' },
    { value: 'investor', label: 'Investor' },
    { value: 'other', label: 'Other' }
  ];

  const placeholder = `Describe the situation that requires an apology...`;

  export let initialType: 'personal' | 'professional' = 'personal';

  let currentStep = 1;
  const totalSteps = 4;
  
  let letterType: 'personal' | 'professional' = 'personal';
  let relationship = '';
  let customRelationship = '';
  let selectedTone = tones[0]?.value || 'formal';
  let customTone = '';
  let context = '';
  let loading = false;
  let isTransitioning = false;

  // Para los inputs de texto
  let textareaElement: HTMLTextAreaElement;
  let customRelationshipInput: HTMLInputElement;
  let customToneInput: HTMLInputElement;
  let formElement: HTMLFormElement;

  // Inicializar letterType cuando initialType esté disponible
  $: if (initialType) {
    letterType = initialType;
  }

  $: progressWidth = `${(currentStep / totalSteps) * 100}%`;
  $: availableRecipients = letterType === 'personal' ? personalRecipients : professionalRecipients;

  onMount(() => {
    // Manejadores de teclado estilo Typeform
    const handleKeydown = (e: KeyboardEvent) => {
      if (loading || isTransitioning) return;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (currentStep === 4 && document.activeElement === textareaElement) {
            // Si estamos en el textarea, permitir Enter normal a menos que sea Ctrl+Enter
            if (e.ctrlKey || e.metaKey) {
              handleNext();
            }
          } else if ((currentStep === 2 && relationship === 'other' && document.activeElement === customRelationshipInput) ||
                     (currentStep === 3 && selectedTone === 'other' && document.activeElement === customToneInput)) {
            // Si estamos en un input personalizado, permitir Enter para continuar
            handleNext();
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
        return !!relationship && (relationship !== 'other' || !!customRelationship.trim());
      case 3:
        return !!selectedTone && (selectedTone !== 'other' || !!customTone.trim());
      case 4:
        return !!context.trim();
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
          // Focus en elementos específicos según el paso
          if (currentStep === 2 && relationship === 'other') {
            setTimeout(() => customRelationshipInput?.focus(), 100);
          } else if (currentStep === 3 && selectedTone === 'other') {
            setTimeout(() => customToneInput?.focus(), 100);
          } else if (currentStep === 4) {
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
    
    // Submit the form normally - Astro Actions will handle it
    if (formElement) {
      formElement.submit();
    }
  }

  function selectOption(value: string, field: 'letterType' | 'relationship' | 'tone') {
    switch(field) {
      case 'letterType':
        letterType = value as 'personal' | 'professional';
        // Auto-advance para tipo de carta
        setTimeout(() => handleNext(), 300);
        break;
      case 'relationship':
        relationship = value;
        // Si selecciona "other", focus en el input
        if (value === 'other') {
          setTimeout(() => customRelationshipInput?.focus(), 100);
        } else {
          // Auto-advance para relationship (excepto "other")
          setTimeout(() => handleNext(), 300);
        }
        break;
      case 'tone':
        selectedTone = value;
        // Si selecciona "other", focus en el input
        if (value === 'other') {
          setTimeout(() => customToneInput?.focus(), 100);
        } else {
          // Auto-advance para tone (excepto "other")
          setTimeout(() => handleNext(), 300);
        }
        break;
    }
  }

  function getDisplayValue(field: 'relationship' | 'tone'): string {
    if (field === 'relationship') {
      if (relationship === 'other') {
        return customRelationship || 'Other';
      }
      const recipient = availableRecipients.find(r => r.value === relationship);
      return recipient?.label || '';
    } else {
      if (selectedTone === 'other') {
        return customTone || 'Other';
      }
      const tone = tones.find(t => t.value === selectedTone);
      return tone?.label || '';
    }
  }
</script>

<!-- Fondo con gradiente estilo Typeform -->
<div class="" >
  
  <!-- Barra de progreso minimalista -->
  <div class="fixed top-0 left-0 right-0 z-50">
    <div class="h-1 bg-gray-200">
      <div 
        class="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
        style="width: {progressWidth}"
      ></div>
    </div>
  </div>

  <!-- Contenedor principal -->
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
          <div class="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="space-y-4">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                What type of apology letter do you need?
              </h1>
              <p class="text-xl text-gray-600">
                Choose the category that best fits your situation
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <button
                type="button"
                on:click={() => selectOption('professional', 'letterType')}
                class="group p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 {letterType === 'professional' ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}"
              >
                <div class="flex flex-col items-center space-y-4">
                  <div class="w-16 h-16 rounded-full {letterType === 'professional' ? 'bg-purple-100' : 'bg-gray-100'} flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-8 h-8 {letterType === 'professional' ? 'text-purple-600' : 'text-gray-600'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="text-center">
                    <h3 class="text-2xl font-semibold text-gray-800">Professional</h3>
                    <p class="text-gray-600 mt-2">Work & Business Relations</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                on:click={() => selectOption('personal', 'letterType')}
                class="group p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 {letterType === 'personal' ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}"
              >
                <div class="flex flex-col items-center space-y-4">
                  <div class="w-16 h-16 rounded-full {letterType === 'personal' ? 'bg-purple-100' : 'bg-gray-100'} flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-8 h-8 {letterType === 'personal' ? 'text-purple-600' : 'text-gray-600'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div class="text-center">
                    <h3 class="text-2xl font-semibold text-gray-800">Personal</h3>
                    <p class="text-gray-600 mt-2">Family, Friends & Loved Ones</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        {/if}

        <!-- Step 2: Relationship -->
        {#if currentStep === 2}
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="space-y-4">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                Who are you apologizing to? *
              </h1>
              <p class="text-xl text-gray-600">
                Select your relationship with the recipient
              </p>
            </div>

            <!-- Opciones estilo Typeform con letras -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-12">
              {#each availableRecipients as recipient, index}
                <button
                  type="button"
                  on:click={() => selectOption(recipient.value, 'relationship')}
                  class="flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 text-left {relationship === recipient.value ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}"
                >
                  <span class="flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold {relationship === recipient.value ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-400 bg-white text-gray-600'}">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div class="flex-1 min-w-0">
                    {#if recipient.value === 'other' && relationship === 'other'}
                      <input
                        bind:this={customRelationshipInput}
                        bind:value={customRelationship}
                        type="text"
                        placeholder="Type your answer..."
                        class="w-full text-lg font-medium bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
                        on:click|stopPropagation
                      />
                    {:else}
                      <span class="text-lg font-medium text-gray-800 block truncate">{recipient.label}</span>
                      {#if recipient.description}
                        <p class="text-sm text-gray-500 truncate">{recipient.description}</p>
                      {/if}
                    {/if}
                  </div>
                  {#if relationship === recipient.value}
                    <svg class="w-5 h-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
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
            <div class="space-y-4">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                What tone should we use? *
              </h1>
              <p class="text-xl text-gray-600">
                Choose the style that feels right for your situation
              </p>
            </div>

            <!-- Opciones estilo Typeform con letras -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-12">
              {#each tones as tone, index}
                <button
                  type="button"
                  on:click={() => selectOption(tone.value, 'tone')}
                  class="flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 text-left {selectedTone === tone.value ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}"
                >
                  <span class="flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold {selectedTone === tone.value ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-400 bg-white text-gray-600'}">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div class="flex-1 min-w-0">
                    {#if tone.value === 'other' && selectedTone === 'other'}
                      <input
                        bind:this={customToneInput}
                        bind:value={customTone}
                        type="text"
                        placeholder="Type your answer..."
                        class="w-full text-lg font-medium bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
                        on:click|stopPropagation
                      />
                    {:else}
                      <span class="text-lg font-medium text-gray-800 block truncate">{tone.label}</span>
                      <!-- <p class="text-sm text-gray-500 truncate">{tone.description}</p> -->
                    {/if}
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

        <!-- Step 4: Context (moved to last) -->
        {#if currentStep === 4}
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="space-y-4">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                What happened? *
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
            </div>
          </div>
        {/if}

        <!-- Botones de navegación al final del contenido -->
        <div class="mt-16 pt-8 ">
          <div class="flex justify-between items-center">
            <!-- Botón Previous -->
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

            <!-- Indicador de paso -->
            <!-- <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">{currentStep} of {totalSteps}</span>
            </div> -->

            <!-- Botón Next/Submit -->
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

      <!-- Formulario HTML para Astro Actions -->
      <form bind:this={formElement} action={actions.createLetter} method="POST" style="display: none;">
        <input type="hidden" name="relationship" value={relationship === 'other' ? customRelationship : relationship} />
        <input type="hidden" name="context" value={context} />
        <input type="hidden" name="tone" value={selectedTone === 'other' ? customTone : selectedTone} />
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