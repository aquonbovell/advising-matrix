<script lang="ts">
	export let required: boolean = false;
	let f: string | undefined = undefined;
	export { f as for };
</script>

<label for={f} class="mb-2 block text-sm font-medium">
	<slot />
	{#if required}
		<span class="text-rose-500">*</span>
	{/if}
</label>
