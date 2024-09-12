<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	let timeOutFunction: string | number | NodeJS.Timeout | undefined;

	onMount(() => {
		// Get the current page store value
		const currentPage = get(page);

		if (currentPage.status === 404) {
			timeOutFunction = setTimeout(() => {
				goto('/admin/users');
			}, 5000);
		}
	});

	onDestroy(() => {
		clearTimeout(timeOutFunction);
	});
</script>

<h1>{$page.status}: {$page.error?.message}</h1>
{#if $page.status === 404}
	Redirecting...
{/if}
