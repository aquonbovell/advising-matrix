<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import DataTable from '../../admin/courses/data-table.svelte';
</script>

<DataTable {data} />
