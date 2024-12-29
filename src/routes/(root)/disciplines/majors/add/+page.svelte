<script lang="ts">
	import AddMajorForm from '$lib/components/add-major-form.svelte';
	import AddUserForm from '$lib/components/add-user-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<AddMajorForm data={data.form} />
</div>
