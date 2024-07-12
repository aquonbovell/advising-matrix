<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';

	$: user = $page.data.user;
</script>

<Sidebar {user} />
<main class="ps-16 md:ps-64">
	<slot />
</main>
