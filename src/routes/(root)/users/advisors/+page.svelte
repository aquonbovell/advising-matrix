<script lang="ts">
	import type { PageData } from './$types';
	import { columns } from './columns';
	import DataTable from './data-table.svelte';

	let { data }: { data: PageData } = $props();
</script>

<DataTable {columns} data={data.advisors} />
