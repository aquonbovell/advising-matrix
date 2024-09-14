<script lang="ts">
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';
	import StudentData from '$lib/components/matrix/StudentData.svelte';
	import * as Button from '$lib/components/ui/button';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<StudentChart studentId={data.studentId} />
