<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-2xl">
	<div class="flex items-baseline justify-between">
		<h1 class="font-bold">Majors</h1>
		<Button href="/admin/majors/create" variant="link">New major</Button>
	</div>

	<DataTable {data} />
</div>
