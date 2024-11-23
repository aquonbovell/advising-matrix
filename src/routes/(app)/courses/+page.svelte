<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Courses</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/courses/create" class="px-0">Create Course</Button.Root>
	{/if}
</div>

<DataTable
	data={data.courses.map((c) => {
		return { ...c, role: data.user.role };
	})}
	{columns}
/>
