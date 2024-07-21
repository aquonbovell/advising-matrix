<script lang="ts">
	import type { HTMLOptionAttributes } from 'svelte/elements';

	export let value: HTMLOptionAttributes['value'];
	export let disabled: boolean = false;

	let selected: boolean = false;
</script>

<button
	type="button"
	data-value={value}
	data-type={typeof value}
	class="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none enabled:hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-50"
	{disabled}
>
	<slot />
</button>
