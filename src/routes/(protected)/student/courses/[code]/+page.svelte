<script lang="ts">
	import type { PageData } from './$types';
	import ViewForm from './view-form.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="font-bold">View Course</h1>

	<ViewForm data={data.form} departments={data.departments} courses={data.courses} />
</div>
