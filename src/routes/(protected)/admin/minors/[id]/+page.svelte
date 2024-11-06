<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import EditForm from './edit-form.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-3xl">
	<h1 class="font-bold">Edit Major</h1>

	<EditForm data={data.form} courses={data.courses} faculties={data.faculties} />
</div>
