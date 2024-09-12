<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { notifications } from '$lib/stores/notifications';

	$: user = $page.data.user;
</script>

<slot name="sidebar">
	<Sidebar {user} />
</slot>

<slot name="main">
	<main class="ms-16 h-dvh overflow-y-auto bg-gray-50 p-6 md:ms-64">
		<div class=" mx-auto h-full max-w-5xl">
			<slot />
			<Toast />
		</div>
	</main>
</slot>
