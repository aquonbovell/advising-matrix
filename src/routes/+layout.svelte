<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	let { children }: { children: Snippet } = $props();

	injectAnalytics();
</script>

<ModeWatcher />
{@render children()}
