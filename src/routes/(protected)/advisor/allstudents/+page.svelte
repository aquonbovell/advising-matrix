<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import DataTable from './data-table.svelte';
</script>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<DataTable {data} />
