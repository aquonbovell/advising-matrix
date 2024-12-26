<script lang="ts">
	import '../../auth.css';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children }: { data: LayoutData; children: Snippet } = $props();
</script>

<main>
	<div class="gradient-container">
		<div class="gradient"></div>
	</div>
	{@render children()}
</main>
