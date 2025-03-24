<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import type { Link } from '$lib/server/db/schema';
  import LinkForm from '$components/LinkForm.svelte';
  import LinkList from '$components/LinkList.svelte';

  export let data: PageData;

  let links: (Link & { clicks: number })[] = data.links;

  const created = (event: CustomEvent<{ uuid: string; slug: string; url: string }>) => {
    const newLink: Link & { clicks: number } = {
      uuid: event.detail.uuid,
      userId: data.user.uuid,
      slug: event.detail.slug,
      url: event.detail.url,
      createdAt: new Date(),
      updatedAt: new Date(),
      clicks: 0
    };

    links = [newLink, ...links];
  };

  $: links;
</script>

<svelte:head>
  <title>Dashboard - Wastu.FYI</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

        <form class="flex items-center space-x-4" method="post" action="?/logout" use:enhance>
          <span class="text-sm text-gray-600">{data.user.name}</span>

          <button type="submit" class="cursor-pointer text-sm text-red-600 hover:text-red-800">
            Logout
          </button>
        </form>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="overflow-hidden rounded-lg bg-white shadow">
      <div class="p-6">
        <h2 class="mb-4 text-lg font-medium text-gray-900">Create Short Link</h2>
        <LinkForm on:success={created} />
      </div>
    </div>

    <div class="mt-8 overflow-hidden rounded-lg bg-white shadow">
      <div class="p-6">
        <h2 class="mb-4 text-lg font-medium text-gray-900">Your Short Links</h2>

        {#if links.length > 0}
          <LinkList {links} />
        {:else}
          <div class="py-8 text-center">
            <p class="text-gray-500">You haven't created any short links yet.</p>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>
