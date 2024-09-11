<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	import StudentPage from '$lib/components/StudentData.svelte';
</script>

<StudentPage {data} />
