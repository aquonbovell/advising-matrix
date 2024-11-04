<script lang="ts">
	import type { PageData } from './$types';
	import EditForm from './edit-form.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="font-bold">Edit Course</h1>

	<EditForm data={data.form} departments={data.departments} courses={data.courses} />
</div>
