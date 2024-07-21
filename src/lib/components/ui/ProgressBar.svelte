<script lang="ts">
	import { onMount } from 'svelte';
	import { sineOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	export let progress: number = 0;
	export let secondaryProgress: number | null = null;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	const barProgress = tweened(0, { duration: 300, easing: sineOut });
	const barProgressSecondary = tweened(0, { duration: 200, easing: sineOut });

	const sizeClasses = {
		sm: 'h-1.5',
		md: 'h-2.5',
		lg: 'h-3.5'
	};

	onMount(() => {
		barProgress.set(progress);
		if (secondaryProgress !== null) {
			barProgressSecondary.set(secondaryProgress);
		}
	});

	$: barProgress.set(progress);
	$: if (secondaryProgress !== null) barProgressSecondary.set(secondaryProgress);
</script>

<div class="w-full overflow-hidden rounded-full bg-gray-200 {sizeClasses[size]}">
	<div
		class="h-full rounded-full bg-blue-600 transition-all duration-1000"
		style="width: {$barProgress}%"
	>
		{#if secondaryProgress !== null}
			<div
				class="h-full rounded-full bg-blue-400 transition-all duration-500"
				style="width: {($barProgressSecondary / Math.max($barProgress || 1)) * 100}%"
			></div>
		{/if}
	</div>
</div>
