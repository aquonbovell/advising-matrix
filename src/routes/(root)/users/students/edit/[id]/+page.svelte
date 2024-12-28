<script lang="ts">
	import EditUserForm from '$lib/components/edit-user-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<EditUserForm data={data.form} />
</div>
