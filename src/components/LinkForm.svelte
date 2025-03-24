<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let url: string = '';
  let slug: string = '';
  let isLoading: boolean = false;
  let error: string = '';
  let uuid: string = '';

  const submit = async (event: Event) => {
    event.preventDefault();

    isLoading = true;
    error = '';
    uuid = '';

    const formData = new FormData();
    formData.append('url', url);

    if (slug) {
      formData.append('slug', slug);
    }

    const response = await fetch('/?/create', { method: 'POST', body: formData });

    let result;

    try {
      result = await response.json();

      if (typeof result.data === 'string') {
        result.data = JSON.parse(result.data);
      }
    } catch (e) {
      error = 'Invalid response from server';
      isLoading = false;
      return;
    }

    isLoading = false;

    if (!response.ok || result.type === 'failure') {
      error = result.data?.[1] || 'Something went wrong!';
      return;
    }

    uuid = result.data?.[2];
    slug = result.data?.[3];

    dispatch('success', { uuid, slug, url });
    url = slug = '';
  };
</script>

<form class="space-y-4" on:submit={submit}>
  {#if error}
    <div class="rounded border-l-4 border-red-500 bg-red-50 p-4">
      <p class="text-sm text-red-700">{error}</p>
    </div>
  {/if}

  {#if uuid}
    <div class="rounded border-l-4 border-green-500 bg-green-50 p-4">
      <p class="text-sm text-green-500">Successfully create a short link</p>
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div class="col-span-2 sm:col-span-1">
      <label for="url" class="mb-2 block text-sm font-medium text-gray-700">Original URL</label>

      <input
        type="text"
        id="url"
        bind:value={url}
        placeholder="https://example.com/your-long-url"
        class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </div>

    <div class="col-span-2 sm:col-span-1">
      <label for="slug" class="mb-2 block text-sm font-medium text-gray-700">
        Custom Code (Optional)
      </label>

      <input
        type="text"
        id="slug"
        bind:value={slug}
        placeholder="e.g., my-link"
        class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  </div>

  <div class="flex justify-end">
    <button
      type="submit"
      class="rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      disabled={isLoading}
    >
      {isLoading ? 'Creating ...' : 'Create Short Link'}
    </button>
  </div>
</form>
