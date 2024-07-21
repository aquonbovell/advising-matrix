<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container px-6 py-3">
	<h1>Academic Advisor</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="rounded-lg bg-white p-6 shadow">
			{#if data.advisor}
				<img src={data.advisor.image} alt="Advisor" class="mx-auto mb-4 h-24 w-24 rounded-full" />

				<h2 class="text-lg font-semibold text-gray-800">Academic Advisor</h2>
				<p class="text-sm text-gray-600">Mr. TempName</p>
				<p class="text-sm text-gray-600">{data.advisor.email}</p>
			{:else}
				<p>No advisor found</p>
			{/if}
		</div>
	</div>
</div>
