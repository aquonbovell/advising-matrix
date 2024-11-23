<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import Icon from '@iconify/svelte';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: WithElementRef<HTMLInputAttributes> = $props();

	let hidden = $state(true);

	let type = $derived(hidden ? 'password' : 'text');
</script>

<div class="relative flex">
	<input
		{type}
		bind:this={ref}
		class={cn(
			'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		bind:value
		oninput={() => (hidden = true)}
		{...restProps}
		placeholder="Enter your password"
	/>
	<button
		type="button"
		class="absolute right-0 flex h-full items-center px-1 text-foreground hover:text-foreground/65"
		onclick={() => (hidden = !hidden)}
	>
		{#if hidden}
			<Icon icon="mdi:eye-off-outline" width="1.1rem" />
		{:else}
			<Icon icon="mdi:eye-outline" width="1.1rem" />
		{/if}
	</button>
</div>
