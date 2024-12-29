<script lang="ts">
	import AddDepartmentForm from '$lib/components/add-department-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<AddDepartmentForm data={data.form} faculties={data.faculties} />
</div>
