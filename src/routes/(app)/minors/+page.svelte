<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	const minors = writable<
		{
			id: string;
			code: string;
			level: number;
			name: string;
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/minors?page=0&size=1');

		const data: {
			id: string;
			code: string;
			level: number;
			name: string;
		}[] = await res.json();

		minors.update(() => data);
	});
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Minor</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/minors/create">Create Minor</Button.Root>
	{/if}
</div>

<DataTable
	data={$minors.map((m) => {
		return { ...m, role: data.user.role };
	})}
	{columns}
/>
