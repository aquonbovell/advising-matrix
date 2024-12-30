<script lang="ts">
	import EditMinorForm from '$lib/components/edit-minor-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<EditMinorForm data={data.form} />
</div>
