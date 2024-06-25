<script lang="ts">
	import Header from '$lib/Header.svelte';
	import '../app.css';
</script>

<div class="dark:bg-black dark:text-white px-4">
	<div class="container mx-auto">
		<Header />
		<main>
			<slot />
		</main>
	</div>
</div>
