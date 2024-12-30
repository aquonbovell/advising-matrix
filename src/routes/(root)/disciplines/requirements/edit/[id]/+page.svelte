<script lang="ts">
	import EditRequirementForm from '$lib/components/edit-requirement-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<EditRequirementForm data={data.form} courses={data.courses} faculties={data.faculties} />
</div>
