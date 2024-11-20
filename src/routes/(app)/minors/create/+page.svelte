<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-xl">
	<h1 class="font-bold">Create minor</h1>
	<Create data={data.form} courses={data.courses} faculties={data.faculties} />
</div>
