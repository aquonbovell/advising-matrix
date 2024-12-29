<script lang="ts">
	import AddCourseForm from '$lib/components/add-course-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<AddCourseForm data={data.form} departments={data.departments} courses={data.courses} />
</div>
