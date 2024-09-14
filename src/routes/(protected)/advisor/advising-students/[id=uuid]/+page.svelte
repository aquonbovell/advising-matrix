<script lang="ts">
	import type { PageData } from './$types';
	import StudentForm from './student-form.svelte';
	export let data: PageData;
</script>

<div class="mx-auto max-w-fit">
	<h1 class="mb-4 text-2xl font-bold">Student Details</h1>
	<StudentForm data={data.form} minors={data.minors} majors={data.majors} />
</div>
