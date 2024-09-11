<script lang="ts">
	import Toast from '$lib/components/Toast.svelte';
	import { page } from '$app/stores';
	import { notifications } from '$lib/stores/notifications';

	$: {
		if ($page.status === 500) {
			notifications.info($page.error?.message ?? 'Something went wrong', 5000);
		}
	}
</script>

{#if $page.status === 500}
	<slot />
	<Toast />
{:else}
	<div
		class="flex min-h-full min-w-80 items-center justify-center bg-gradient-to-b from-[#fdfdfc] to-[#f9f9f8] p-5 font-sans"
	>
		<slot />
		<Toast />
	</div>
{/if}
