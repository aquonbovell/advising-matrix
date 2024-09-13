<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($page.status === 404) {
			setTimeout(() => {
				goto('/');
			}, 5000);
		}
	});
</script>

<h1>{$page.status}: {$page.error?.message}</h1>
{#if $page.status === 404}
	<p>We are redirecting...to the dashboard</p>
{:else}
	<p>Click <a href="/">here</a> to go back to the home page.</p>
{/if}
