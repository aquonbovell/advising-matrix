<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const departments = writable<
		{
			id: string;
			departmentName: string;
			facultyName: string;
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/departments');
		const data: {
			id: string;
			departmentName: string;
			facultyName: string;
		}[] = await res.json();

		departments.update(() => data);
	});
</script>

<div class="flex items-baseline justify-between">
	<h1 class="text-lg font-bold">Departments</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/departments/create" class="px-0"
			>Create Department</Button.Root
		>
	{/if}
</div>

<DataTable
	data={$departments.map((d) => {
		return { ...d, role: data.user.role };
	})}
	{columns}
/>
