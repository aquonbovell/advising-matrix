<script lang="ts">
	import StudentData from '$lib/components/matrix/StudentData.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<StudentData {data} />
