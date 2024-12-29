<script lang="ts">
	import EditFacultyForm from '$lib/components/edit-faculty-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<EditFacultyForm data={data.form} />
</div>
