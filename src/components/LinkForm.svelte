<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { generateCode } from '$lib/utils';
  import { browser } from '$app/environment';
  import { m } from '$lib/paraglide/messages';
  import { invalidateAll } from '$app/navigation';

  let host = 'wastu.fyi';
  let isLoading: boolean = false;

  onMount(() => {
    if (browser) {
      host = window.location.host;
    }
  });
</script>

<form
  class="space-y-4"
  method="POST"
  action="?/create"
  use:enhance={() => {
    isLoading = true;

    return async ({ update }) => {
      isLoading = false;

      await update();
      await invalidateAll();
    };
  }}
>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div class="col-span-2 sm:col-span-1">
      <label for="url" class="mb-2 block text-sm font-medium text-gray-700">
        {m.destination_url()}
      </label>

      <input
        type="text"
        id="url"
        name="url"
        placeholder="https://stt-wastukancana.ac.id/sejarah.htm"
        class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </div>

    <div class="col-span-2 sm:col-span-1">
      <label for="slug" class="mb-2 block text-sm font-medium text-gray-700">
        {m.short_link()} ({m.optional()})
      </label>

      <div class="flex rounded-md shadow-sm">
        <span
          class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
        >
          {host}/
        </span>

        <input
          type="text"
          id="slug"
          name="slug"
          placeholder="e.g., my-link"
          value={generateCode()}
          class="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  </div>

  <div class="flex justify-end">
    <button
      type="submit"
      class="rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      disabled={isLoading}
    >
      {isLoading ? m.creating() : m.create()}
    </button>
  </div>
</form>
