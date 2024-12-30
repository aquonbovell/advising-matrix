<script lang="ts">
	import EditMajorForm from '$lib/components/edit-major-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<EditMajorForm data={data.form} requirements={data.requirements} />
</div>
