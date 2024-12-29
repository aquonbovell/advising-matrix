<script lang="ts">
	import AddFacultyForm from '$lib/components/add-faculty-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<AddFacultyForm data={data.form} />
</div>
