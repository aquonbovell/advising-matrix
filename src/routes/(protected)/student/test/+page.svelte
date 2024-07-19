<script lang="ts">
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { RequirementGroup } from '$lib/types';

	export let data: PageData;

	$: ({ major, groupedRequirements, courses } = data);

	function switchMajor() {
		const newMajor = major === 'cs' ? 'it' : 'cs';
		goto(`?major=${newMajor}`, { replaceState: true });
	}

	function formatRequirement(req: RequirementGroup): {
		type: 'CREDITS' | 'POOL';
		content: string[];
	} {
		if (req.type === 'CREDITS') {
			return {
				type: 'CREDITS',
				content: courses
					.filter((c) => req.courses.includes(c.id))
					.map((c) => `${c.code} - ${c.name}`)
			};
		} else {
			const facultyString = req.facultyPool === 'any' ? 'any Faculty' : req.facultyPool.join('/');
			return {
				type: 'POOL',
				content: [
					`AND ${req.credits} Credits from Level ${req.levelPool.join('/')} ${facultyString}`
				]
			};
		}
	}
</script>

<div class="container mx-auto max-w-3xl px-4 py-8">
	<h1 class="mb-4 text-3xl font-bold">Checklist Progress</h1>
	<div class="mb-8">
		<ProgressBar progress={50} secondaryProgress={25} size="lg" />
	</div>

	<h1 class="mb-4 text-2xl font-semibold">
		{major === 'cs' ? 'Computer Science' : 'Information Technology'} Degree Path
	</h1>

	<button
		on:click={switchMajor}
		class="mb-6 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
	>
		Switch to {major === 'cs' ? 'Information Technology' : 'Computer Science'}
	</button>

	{#each Object.entries(groupedRequirements) as [level, requirements]}
		<div class="mb-8">
			<h2 class="mb-2 text-xl font-semibold">{level}</h2>
			<ul class="space-y-2">
				{#each requirements as req}
					{@const formattedReq = formatRequirement(req)}
					<li class="rounded bg-gray-100 p-3">
						{#if formattedReq.type === 'CREDITS'}
							<ul class="list-disc pl-5">
								{#each formattedReq.content as course}
									<li>{course}</li>
								{/each}
							</ul>
						{:else}
							<p>{formattedReq.content[0]}</p>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>
