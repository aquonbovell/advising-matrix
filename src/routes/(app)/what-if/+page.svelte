<script lang="ts">
	import Matrix from '$lib/components/matrix/matrix.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let selectedMajor = $state<string | undefined>(undefined);
	let selectedMinor = $state<string | undefined>(undefined);
</script>

<Card.Root class="glass mx-auto mb-4 h-max bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between text-base"
			>What if i change my major</Card.Title
		>
	</Card.Header>
	<Card.Content>
		<form action="?/getTree" method="get">
			<div class="flex items-center gap-2">
				<label for="majorId" class="">
					Select a major
					<Select.Root bind:value={selectedMajor} type="single" required>
						<Select.Trigger class="max-w-lg">
							{selectedMajor
								? data.majors.find((major) => major.id === selectedMajor)?.name
								: 'Select a major'}
						</Select.Trigger>
						<Select.Content class="max-h-80 overflow-auto">
							{#each data.majors as major}
								<Select.Item value={major.id}>{major.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="majorId" value={selectedMajor} />
				</label>
				<label for="minorId" class="">
					Select a minor
					<Select.Root bind:value={selectedMinor} type="single" required>
						<Select.Trigger class="max-w-lg">
							{selectedMinor
								? data.minors.find((minor) => minor.id === selectedMinor)?.name
								: 'Select a minor'}
						</Select.Trigger>
						<Select.Content class="max-h-80 overflow-auto">
							{#each data.minors as minor}
								<Select.Item value={minor.id}>{minor.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="minorId" value={selectedMinor} />
				</label>
			</div>
			<Button.Root type="submit">Explore</Button.Root>
		</form>
	</Card.Content>
</Card.Root>
{#if data.degree && data.studentCourses}
	<Matrix studentDegree={data.degree} studentCourses={data.studentCourses} userId={data.user.id} />
{/if}
