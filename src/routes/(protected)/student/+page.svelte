<script lang="ts">
	import type { PageData } from './$types';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';
	export let data: PageData;
	import { site } from '$lib/utils';
</script>

<svelte:head>
	<title>{site}: Student Dashboard</title>
</svelte:head>

<h1>Dashboard</h1>
<StudentChart studentId={data.studentId} />
