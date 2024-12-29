<script lang="ts">
	import EditDepartmentForm from '$lib/components/edit-department-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<EditDepartmentForm data={data.form} faculties={data.faculties} />
</div>
