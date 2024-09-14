<script lang="ts">
	import type { PageData } from './$types';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';
	export let data: PageData;
</script>

<StudentChart studentId={data.studentId} />
