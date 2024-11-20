<script lang="ts">
	import type { PageData } from './$types';
	import Update from './update.form.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-xl">
	<h1 class="font-bold">Edit major</h1>
	<Update data={data.form} courses={data.courses} faculties={data.faculties} />
</div>
