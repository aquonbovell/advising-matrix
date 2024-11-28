<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Minor</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/minors/create">Create Minor</Button.Root>
	{/if}
</div>

<DataTable
	data={data.minors.map((m) => {
		return { ...m, role: data.user.role };
	})}
	{columns}
/>
