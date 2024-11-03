<script lang="ts">
	import type { PageData } from './$types';
	import CreateForm from './create-form.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-xl">
	<h1 class="font-bold">Create Department</h1>
	<CreateForm data={data.form} departments={data.departments} courses={data.courses} />
</div>
