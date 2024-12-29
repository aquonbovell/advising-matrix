<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { columns } from './columns';
	import DataTable from './data-table.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<pre>{JSON.stringify(form, null, 2)}</pre>

<DataTable {columns} data={data.minors} />
