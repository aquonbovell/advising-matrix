<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1 class="text-xl font-bold">Dashboard of Advising Matrix</h1>
<p>Welcome, {data.user?.name}!</p>
<p>Here are some quick links to get you started:</p>
