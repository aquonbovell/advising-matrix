<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { HTMLOptionAttributes } from 'svelte/elements';

	export let value: HTMLOptionAttributes['value'] = undefined;
	export let disabled: boolean = false;
	export let placeholder: string = 'Select an option';

	let show: boolean = false;
	let selectedOption: HTMLButtonElement | null = null;
	let dropdownRef: HTMLDivElement;
	let buttonRef: HTMLButtonElement;

	const dispatch = createEventDispatcher();

	function toggleDropdown() {
		if (!disabled) {
			show = !show;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			show = false;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleDropdown();
		}
	}

	function selectOption(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const option = target.closest('button[data-value]') as HTMLButtonElement;

		if (option) {
			const optionValue = option.getAttribute('data-value');
			const optionType = option.getAttribute('data-type');
			let newValue: any = optionValue;

			if (optionType === 'number') {
				newValue = parseFloat(optionValue!);
			} else if (optionType === 'boolean') {
				newValue = optionValue === 'true';
			}

			value = newValue;
			show = false;

			dispatch('change', { value });
			updateSelectedContent();
		}
	}

	function updateSelectedContent() {
		if (dropdownRef && value !== undefined) {
			const options = dropdownRef.querySelectorAll('button[data-value]');
			options.forEach((option) => {
				if (option.getAttribute('data-value') === String(value)) {
					selectedOption = option as HTMLButtonElement;
				}
			});
		}
	}

	onMount(() => {
		updateSelectedContent();
		if (value === undefined && dropdownRef?.firstElementChild) {
			const firstOption = dropdownRef.firstElementChild as HTMLButtonElement;
			value = firstOption.getAttribute('data-value');
			selectedOption = firstOption;
		}
	});

	$: if (value !== undefined) {
		updateSelectedContent();
	}
</script>

<div class="relative">
	<button
		type="button"
		bind:this={buttonRef}
		on:click={toggleDropdown}
		on:keydown={handleKeyDown}
		{disabled}
		class="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
	>
		<span>{selectedOption ? selectedOption.textContent : placeholder}</span>
		<ChevronIcon rotation={show ? '180deg' : '0deg'} />
	</button>

	{#if show}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			bind:this={dropdownRef}
			use:clickOutside
			on:clickoutside={() => (show = false)}
			on:click={selectOption}
			role="listbox"
			tabindex="-1"
			class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm"
		>
			<slot {value} />
		</div>
	{/if}
</div>
