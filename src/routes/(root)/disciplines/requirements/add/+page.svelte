<script lang="ts">
	import AddRequirementForm from '$lib/components/add-requirement-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<AddRequirementForm data={data.form} courses={data.courses} faculties={data.faculties} />
</div>
