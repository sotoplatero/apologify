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
  ];

  const personalRecipients: Recipient[] = [
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'wife', label: 'Wife' },
    { value: 'husband', label: 'Husband' },
    { value: 'friend', label: 'Friend' },
    { value: 'romantic', label: 'Romantic' }
  ];

  const professionalRecipients = [
    { value: 'manager', label: 'Manager', description: 'For team leaders.' },
    { value: 'supervisor', label: 'Supervisor', description: 'For direct superiors.' },
    { value: 'partner', label: 'Business Partner', description: 'For business associates.' },
    { value: 'client', label: 'Client', description: 'For clients.' },
    { value: 'colleague', label: 'Colleague', description: 'For team members.' },
    { value: 'hr', label: 'HR', description: 'For HR matters.' },
    { value: 'vendor', label: 'Vendor/Supplier', description: 'For suppliers.' },
    { value: 'investor', label: 'Investor', description: 'For stakeholders.' }
  ];

  const placeholder = `Describe the situation that requires an apology.`;

  // Tipamos el initialType
  export let initialType: 'personal' | 'professional';

  let currentStep = 1;
  const totalSteps = 4;
  
  // Inicializamos letterType con el valor de initialType
  let letterType = initialType;
  let relationship = '';
  let context = '';
  let selectedTone = tones[0].value;
  let loading = false;

  // Aseguramos que letterType se actualice si cambia initialType
  $: {
    if (initialType) {
      letterType = initialType;
    }
  }

  $: progressWidth = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
  $: availableRecipients = letterType === 'personal' ? personalRecipients : professionalRecipients;

  // Cuando se monta el componente, seleccionamos el primer recipient disponible
  onMount(() => {
    if (availableRecipients.length > 0) {
      relationship = availableRecipients[0].value;
    }

    // Manejador de Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.location.href = '/generator';
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  });

  function validateStep(step: number): boolean {
    switch(step) {
      case 1:
        return !!letterType;
      case 2:
        return !!relationship;
      case 3:
        return !!context;
      case 4:
        return !!selectedTone;
      default:
        return false;
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
      }
    } else {
      alert('Please fill out all required fields before proceeding.');
    }
  }

  async function handleSubmit() {
    if (!validateStep(currentStep)) {
      alert('Please fill out all required fields before submitting.');
      return;
    }

    loading = true;
    // Aquí iría la lógica de envío del formulario
  }
</script>

<div class="max-w-2xl w-full mx-auto relative pb-24">
  <div class="fixed top-4 right-4 z-50">
    <a 
      href="/generator" 
      class="btn btn-circle bg-base-100 shadow-lg hover:shadow-xl"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </a>
  </div>

  <h2 class="text-2xl sm:text-3xl font-bold text-center mb-2">Apology Letter Wizard</h2>
  <p class="text-center text-gray-600 mb-6 sm:mb-8">Create a personalized apology letter in just a few steps</p>

  <div class="card mb-8">
    <div class="card-body p-4 sm:p-6">
      <!-- <div class="mb-6">
        <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div class="bg-success h-2 rounded-full transition-all duration-300" 
               style="width: {progressWidth}">
          </div>
        </div>
      </div> -->

      <form class="space-y-6" action={'/generator' + actions.createLetter} id="write-letter" method="POST">
        <!-- Step 1: Letter Type -->
        <div class="step h-auto" style="display: {currentStep === 1 ? 'block' : 'none'}">
          <h2 class="text-lg sm:text-xl mb-4 !text-center w-full">
            Type of Apology Letter
          </h2>
          
          <div class="grid grid-cols-2 gap-4">
            <label class="cursor-pointer">
              <input 
                type="radio" 
                name="letterType" 
                value="professional" 
                class="hidden"
                bind:group={letterType}
              />
              <div class="btn btn-outline btn-lg h-48 flex flex-col items-center justify-center gap-2 {letterType === 'professional' ? 'btn-active' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-xl">Professional</span>
                <span class="text-sm text-gray-400">Work & Business Relations</span>
              </div>
            </label>

            <label class="cursor-pointer">
              <input 
                type="radio" 
                name="letterType" 
                value="personal" 
                class="hidden"
                bind:group={letterType}
              />
              <div class="btn btn-outline btn-lg h-48 flex flex-col items-center justify-center gap-2 {letterType === 'personal' ? 'btn-active' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span class="text-xl">Personal</span>
                <span class="text-sm text-gray-400">Family, Friends & Loved Ones</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Step 2: Relationship -->
        <div class="step h-72" style="display: {currentStep === 2 ? 'block' : 'none'}">
          <h2 class="text-lg sm:text-xl mb-4 !text-center w-full">
            Relationship with the recipient
          </h2>
          
          <div class="grid grid-cols-2 gap-4">
            {#each availableRecipients as r}
              <label class="cursor-pointer">
                <input 
                  type="radio" 
                  name="relationship" 
                  value={r.value} 
                  class="hidden"
                  bind:group={relationship}
                />
                <div class="btn btn-outline h-24 flex flex-col items-center justify-center gap-1 {relationship === r.value ? 'btn-active' : ''}">
                  <span class="text-lg">{r.label}</span>
                  <span class="text-xs text-gray-400">{r.description || ''}</span>
                </div>
              </label>
            {/each}
          </div>
        </div>

        <!-- Step 3: Context -->
        <div class="step h-72" style="display: {currentStep === 3 ? 'block' : 'none'}">
          <h2 class="text-lg sm:text-xl mb-4 !text-center w-full">
            Context or situation
          </h2>
          <textarea
            name="context"
            bind:value={context}
            rows="6"
            class="textarea textarea-bordered w-full border-2 border-gray-600"
            required
            {placeholder}
          ></textarea>
        </div>

        <!-- Step 4: Tone -->
        <div class="step h-72" style="display: {currentStep === 4 ? 'block' : 'none'}">
          <h2 class="text-lg sm:text-xl mb-4 !text-center w-full">
            Desired tone
          </h2>
          <div class="grid grid-cols-2 gap-4">
            {#each tones as tone}
              <label class="cursor-pointer">
                <input 
                  type="radio" 
                  name="tone" 
                  value={tone.value} 
                  class="hidden"
                  bind:group={selectedTone}
                />
                <div class="btn btn-outline h-24 flex flex-col items-center justify-center gap-1 {selectedTone === tone.value ? 'btn-active' : ''}">
                  <span class="text-lg">{tone.label}</span>
                  <span class="text-xs text-gray-400">{tone.description}</span>
                </div>
              </label>
            {/each}
          </div>
        </div>
      </form>

      {#if loading}
        <div class="flex flex-col items-center justify-center space-y-4 mt-8">
          <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p class="text-xl font-semibold">Generating your apology letter...</p>
        </div>
      {/if}
    </div>
  </div>

  <div class="fixed bottom-0 left-0 right-0 p-4 bg-base-100 border-t shadow-lg">
    <div class="max-w-2xl mx-auto flex justify-center gap-4">
      <button 
        type="button" 
        class="btn btn-outline min-w-[100px]"
        on:click={handlePrevious}
        disabled={currentStep === 1}
      >
        Previous
      </button>
      {#if currentStep !== totalSteps}
        <button type="button" class="btn btn-primary min-w-[100px]" on:click={handleNext}>    
          Next
        </button>
      {/if}
      {#if currentStep === totalSteps}
        <button type="submit" class="btn btn-primary min-w-[100px]" form="write-letter">
          Submit
        </button>
      {/if}
    </div>
  </div>

</div> 