<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Loading from './Loading.svelte';

	export let loading = false;
	export let disabled = false;
	export let href: string | undefined = undefined;
	export let type: HTMLButtonAttributes['type'] = 'button';
	export let ref: HTMLButtonElement | HTMLAnchorElement | undefined = undefined;
	export let fullWidth = false;

	const baseStyles =
		'rounded-md px-4 py-3 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200';
	const enabledStyles = 'bg-indigo-600 hover:bg-indigo-700';
	const disabledStyles = 'bg-indigo-400 cursor-not-allowed';
	const fullWidthStyle = 'w-full';

	let classname: string = '';
	export { classname as class };
</script>

{#if href != undefined}
	<a
		bind:this={ref}
		{href}
		{...$$restProps}
		on:click
		on:change
		class={cn(baseStyles, enabledStyles, fullWidth && fullWidthStyle, classname)}
	>
		<slot />
	</a>
{:else}
	<button
		bind:this={ref}
		{type}
		{...$$restProps}
		on:click
		on:change
		disabled={disabled || loading}
		class={cn(
			baseStyles,
			disabled || loading ? disabledStyles : enabledStyles,
			fullWidth && fullWidthStyle,
			classname,
			'relative'
		)}
	>
		{#if loading}
			<span class="absolute inset-0 flex items-center justify-center">
				<Loading class="h-5 w-5" />
			</span>
		{/if}
		<span class={loading ? 'invisible' : ''}>
			<slot />
		</span>
	</button>
{/if}
