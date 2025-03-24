<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { m } from '$lib/paraglide/messages';
  import LinkForm from '$components/LinkForm.svelte';
  import LinkList from '$components/LinkList.svelte';

  export let data: PageData;
</script>

<svelte:head>
  <title>{m.dashboard()} - Wastu.FYI</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">{m.dashboard()}</h1>

        <form class="flex items-center space-x-4" method="post" action="?/logout" use:enhance>
          <span class="text-sm text-gray-600">{data.user.name}</span>

          <button type="submit" class="cursor-pointer text-sm text-red-600 hover:text-red-800">
            {m.logout()}
          </button>
        </form>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="overflow-hidden rounded-lg bg-white shadow">
      <div class="p-6">
        <h2 class="mb-4 text-lg font-medium text-gray-900">{m.create_short_link()}</h2>

        <LinkForm />
      </div>
    </div>

    <div class="mt-8 overflow-hidden rounded-lg bg-white shadow">
      <div class="p-6">
        <h2 class="mb-4 text-lg font-medium text-gray-900">{m.your_short_links()}</h2>

        {#if data.links.length > 0}
          <LinkList links={data.links} />
        {:else}
          <div class="py-8 text-center">
            <p class="text-gray-500">{m.you_havent_created_any_short_links_yet()}</p>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>
