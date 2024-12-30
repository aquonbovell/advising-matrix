<script lang="ts">
	import EditStudentForm from '$lib/components/edit-student-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<EditStudentForm data={data.form} majors={data.majors} minors={data.minors} />
</div>
