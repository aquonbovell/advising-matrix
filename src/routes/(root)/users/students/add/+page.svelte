<script lang="ts">
	import AddUserForm from '$lib/components/add-user-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<AddUserForm data={data.form} />
</div>
