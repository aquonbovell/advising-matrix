<script lang="ts">
	import CourseTree from '$lib/components/coursetree/CourseTree.svelte';
	import { trpc } from '$lib/trpc';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import type { RouterOutputs } from '$lib/server/routers';

	let course: RouterOutputs['courses']['findMany']['courses'][0] | undefined = undefined;

	$: courses = trpc.courses.findMany.query();

	let selectedCourseId: Selected<unknown> | undefined = undefined;

	$: {
		course = $courses.data?.courses.find((course) => course.id === selectedCourseId?.value);
	}
</script>

<div class="flex justify-between py-2">
	<h1 class="text-2xl font-bold text-stone-800">Course Checker</h1>
</div>

{#if $courses.isSuccess}
	<div class="block text-sm font-medium text-stone-800">Select a course</div>
	<Select.Root
		onSelectedChange={(cv) => {
			selectedCourseId = cv;
		}}
	>
		<Select.Trigger class="max-w-lg">
			<Select.Value placeholder="Select a course..." />
		</Select.Trigger>
		<Select.Content class="max-h-80 overflow-auto">
			{#each $courses.data.courses as course}
				<Select.Item value={course.id}>{course.name}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
{/if}
{#if course}
	<div class="h-dvh w-full py-6">
		<CourseTree {course} />
	</div>
{/if}
