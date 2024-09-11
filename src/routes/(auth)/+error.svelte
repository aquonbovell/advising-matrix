<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($page.status === 500) {
			setTimeout(() => {
				goto('/');
			}, 5000);
		}
	});
</script>

<div class="p-5">
	<h1>{$page.status}: {$page.error?.message}</h1>
	Redirecting...
</div>
