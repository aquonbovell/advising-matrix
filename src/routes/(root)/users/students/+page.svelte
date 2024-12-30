<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { columns } from './columns';
	import DataTable from './data-table.svelte';

	let { data }: { data: PageData; form: ActionData } = $props();
</script>

<DataTable {columns} data={data.students} />
