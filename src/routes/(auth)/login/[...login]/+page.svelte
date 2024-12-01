<script lang="ts">
	import type { PageData } from './$types';
	import LoginPage from '$lib/components/login-page.svelte';

	let { data }: { data: PageData } = $props();
</script>

<LoginPage form={data.form} />
