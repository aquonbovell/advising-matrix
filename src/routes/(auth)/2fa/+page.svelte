<script lang="ts">
	import TwofaForm from '$lib/components/twofa-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<TwofaForm data={data.form} />
</div>
