<script lang="ts">
	import Matrix from '$lib/components/matrix/matrix.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<Matrix data={data.degree} studentCourses={data.studentCourses} userId={data.user.id} />
