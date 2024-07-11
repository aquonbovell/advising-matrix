<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let password: string;
	export let confirmPassword: string;

	type Requirement = {
		text: string;
		check: (p: string, c?: string) => boolean;
	};

	const requirements: Array<Requirement> = [
		{ text: 'Minimum number of characters is 8.', check: (p) => p.length >= 8 },
		{ text: 'Should contain uppercase.', check: (p) => /[A-Z]/.test(p) },
		{ text: 'Passwords must match.', check: (p, c) => p === c && p !== '' }
	];
</script>

<div class="mt-4">
	<h4 class="mb-2 text-sm font-semibold text-gray-700">Your password must contain:</h4>
	<ul class="space-y-1">
		{#each requirements as req}
			<li class="flex items-center text-sm text-gray-600">
				{#if req.check(password, confirmPassword)}
					<svg
						class="size-4 flex-shrink-0 text-green-500"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
					>
				{:else}
					<svg
						class="size-4 flex-shrink-0 text-red-500"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
					>
				{/if}
				{req.text}
			</li>
		{/each}
	</ul>
</div>
