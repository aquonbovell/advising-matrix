<script lang="ts">
	import DataTable from './data-table.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<DataTable courses={data.courses} count={data.count} />
