<script lang="ts">
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<div class="container mx-auto max-w-3xl px-4 py-8"></div>
