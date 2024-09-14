<script lang="ts">
	import type { PageData } from './$types';
	import StudentData from '$lib/components/matrix/StudentData.svelte';
	export let data: PageData;
</script>

<StudentData data={{ program: data.program }} />
