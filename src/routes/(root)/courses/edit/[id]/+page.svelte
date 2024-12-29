<script lang="ts">
	import EditCourseForm from '$lib/components/edit-course-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<EditCourseForm data={data.form} departments={data.departments} courses={data.courses} />
</div>
