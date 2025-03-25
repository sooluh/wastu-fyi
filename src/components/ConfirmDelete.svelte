<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';

  export let uuid: string;
  export let onCancel: () => void;
</script>

<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/9">
  <div class="mx-4 w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
    <div class="border-b border-gray-200 p-5">
      <h3 class="text-lg font-medium text-gray-900">{m.confirm_deletion()}</h3>
    </div>

    <div class="p-5">
      <p class="text-gray-700">
        {m.are_you_sure_you_want_to_delete_this_short_link_this_action_cannot_be_undone()}
      </p>
    </div>

    <form
      class="flex justify-end space-x-3 bg-gray-50 px-5 py-4"
      method="POST"
      action="/?/unlist"
      use:enhance={() => {
        return async ({ update }) => {
          onCancel();
          await update();
        };
      }}
    >
      <input type="hidden" name="uuid" value={uuid} />

      <button
        type="button"
        on:click={onCancel}
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      >
        {m.cancel()}
      </button>

      <button
        type="submit"
        class="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
      >
        {m.delete()}
      </button>
    </form>
  </div>
</div>
