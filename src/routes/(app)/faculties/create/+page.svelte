<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="font-bold">Create Faculty</h1>
	<Create data={data.form} />
</div>
