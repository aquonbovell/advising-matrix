<script lang="ts">
	import { cn } from '$lib/utils';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Label from './Label.svelte';

	const dispatch = createEventDispatcher<{
		input: { value: string | number };
		change: { value: string | number };
	}>();

	export let id: string | undefined = undefined;
	export let value: HTMLInputAttributes['value'] = '';
	export let type: HTMLInputAttributes['type'] = 'text';
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let readonly: boolean = false;
	export let required: boolean = false;
	export let label: string | undefined = undefined;
	export let hasError: boolean = false;
	export let error: string | undefined = undefined;

	let inputRef: HTMLInputElement;
	let className: HTMLInputAttributes['class'] = undefined;
	let showPassword: boolean = false;

	$: {
		if (inputRef != undefined) {
			inputRef.value = value;
		}
	}

	$: inputType = type === 'password' && showPassword ? 'text' : type;

	function input() {
		const newValue = type === 'number' ? parseFloat(inputRef.value) : inputRef.value;
		value = newValue;
		dispatch('input', { value: newValue });
	}

	function change() {
		const newValue = type === 'number' ? parseFloat(inputRef.value) : inputRef.value;
		value = newValue;
		dispatch('change', { value: newValue });
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	export { className as class };
</script>

{#if label}
	<Label for={id} {required}>
		{label}
	</Label>
{/if}

<div class="relative">
	<input
		{...$$restProps}
		bind:this={inputRef}
		on:change={change}
		on:input={input}
		type={inputType}
		{id}
		{value}
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			'h-11 w-full rounded-md border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 shadow-sm',
			'focus:outline-none focus:ring-2',
			error || hasError
				? 'border-red-500 focus:border-red-500 focus:ring-red-500'
				: 'focus:border-blue-500 focus:ring-blue-200',
			'transition-colors duration-200',
			disabled && 'cursor-not-allowed opacity-50',
			type === 'password' && 'pr-10',
			className
		)}
	/>
	{#if type === 'password'}
		<button
			type="button"
			class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
			on:click={togglePasswordVisibility}
		>
			<svg
				class="size-4 flex-shrink-0"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				{#if !showPassword}
					<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
					<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
					<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
					<line x1="2" x2="22" y1="2" y2="22" />
				{:else}
					<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
					<circle cx="12" cy="12" r="3" />
				{/if}
			</svg>
		</button>
	{/if}
</div>

{#if error}
	<p class="mt-2 text-sm text-red-600" id={`${id}-error`}>{error}</p>
{/if}

<style lang="postcss">
	input[type='password']::-ms-reveal {
		display: none;
	}
</style>
