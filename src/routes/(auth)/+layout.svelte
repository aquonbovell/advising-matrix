<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<main>
	<div class="gradient-container">
		<div class="gradient"></div>
	</div>
	{@render children()}
</main>
