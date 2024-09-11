<script lang="ts">
	import type { PageData } from './$types';
	import StudentData from '$lib/components/StudentData.svelte';

	export let data: PageData;
</script>

<StudentData {data} />
