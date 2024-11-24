<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button/index.js';
	import Tree from '$lib/components/canvas/tree.svelte';
	let { data }: { data: PageData } = $props();

	let selectedCourse = $state<string | undefined>(undefined);
</script>

<Card.Root class="glass mx-auto h-max max-w-4xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Explore Matrix Courses</Card.Title>
	</Card.Header>
	<Card.Content>
		<form action="?/getTree" method="get" class="flex items-center gap-2">
			<label for="courseId" class="w-[32rem]">
				Select a course to explore:
				<Select.Root bind:value={selectedCourse} type="single">
					<Select.Trigger class="max-w-lg">
						{selectedCourse
							? data.courses.find((course) => course.id === selectedCourse)?.name
							: 'Select a course'}
					</Select.Trigger>
					<Select.Content class="max-h-80 overflow-auto">
						{#each data.courses as course}
							<Select.Item value={course.id}>{course.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<input type="hidden" name="courseId" value={selectedCourse} />
			</label>

			<Button.Root type="submit">Explore</Button.Root>
		</form>

		<div class="h-svh w-full py-6">
			{#if data.course}
				<Tree course={data.course} />
			{/if}
		</div>
	</Card.Content>
</Card.Root>
