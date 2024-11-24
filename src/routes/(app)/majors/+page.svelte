<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Majors</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/majors/create">Create Major</Button.Root>
	{/if}
</div>

<DataTable
	data={data.majors.map((m) => {
		return { ...m, role: data.user.role };
	})}
	{columns}
/>
