<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex justify-between">
	<h1>Faculty</h1>
	<Button.Root variant="link" href="/faculties/create">Create Faculty</Button.Root>
</div>

<DataTable data={data.faculties} {columns} />
