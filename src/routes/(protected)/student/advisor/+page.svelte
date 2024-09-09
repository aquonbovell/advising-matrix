<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container px-6 py-3">
	{#if data.advisors}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each data.advisors as advisor}
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="text-lg font-semibold text-gray-800">Academic Advisor</h2>
					<p class="text-sm text-gray-600">{advisor.name}</p>
					<p class="text-sm text-gray-600">{advisor.email}</p>
				</div>
			{/each}
		</div>
	{:else}
		<p>No advisor found</p>
	{/if}
</div>
