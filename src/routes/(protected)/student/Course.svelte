<script lang="ts">
	import type { Course } from '$lib/db/schema';
	import { courseGrades, dialogRequirementID, selectedCourse } from './store';
	import TrashIcon from '$lib/components/icons/TrashIcon.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { gradePoints, type Grade } from '$lib/types';
	import type { Selected } from 'bits-ui';
	import { isCompleted } from '$lib/utils';

	export let course: Course;
	export let required: boolean = true;
	export let requirementId: string;
	export let addGradeDialog: () => void;

	let processedGrades = [] as Selected<Grade>[];

	// Reactive block that responds to changes in courseGrades
	$: {
		// Reset processed grades on each re-run
		processedGrades = [];

		const grades = $courseGrades[course.id]?.grade ?? [];

		console.log('grades:', grades);
		console.log('Processed grades:', processedGrades);

		for (let g of grades) {
			let grade: Selected<Grade> = { value: g as unknown as Grade }; // Cast string to Grade
			processedGrades.push(grade);
		}
	}

	let styles = '';

	$: {
		if (
			($courseGrades[course.id]?.grade.length! > 0 &&
				required &&
				isCompleted($courseGrades[course.id]?.grade)) ||
			(!required && isCompleted($courseGrades[course.id]?.grade))
		) {
			styles = 'bg-green-500';
		} else if ((!$courseGrades[course.id] && required) || ($courseGrades[course.id] && !required)) {
			styles = 'bg-amber-500';
		}
	}
</script>

<div class="flex flex-col justify-between gap-4 py-2 lg:flex-row">
	<div>
		<div class="flex items-center gap-3">
			<span class={`h-5 w-5 rounded-md border ${styles} `}></span>
			<span>{course.code}</span> <span>{course.name}</span>
		</div>
		<div class={`flex items-center gap-3 ${!required ? '' : 'pl-8'}`}>
			{#if !required}
				<button
					class="pl-0.5 pr-0.5 text-red-500 hover:text-red-700"
					on:click={() => {
						courseGrades.update((grades) => {
							const newGrades = { ...grades }; // Create a shallow copy of the grades object
							delete newGrades[course.id]; // Delete the grade associated with the course ID
							return newGrades; // Return the updated grades object
						});
					}}><TrashIcon /></button
				>
			{/if}
			<span>Level: {course.level}</span>
			<span class="rounded-full bg-green-200 px-2 py-0.5 text-sm text-green-600"
				>{course.credits} credits</span
			>
		</div>
	</div>
	<div class="flex flex-row-reverse items-center justify-end gap-4 lg:flex-row">
		{#if $courseGrades[course.id]}
			<div class="flex items-center gap-3 lg:justify-end">
				{#each processedGrades as grade}
					<Select.Root
						required={true}
						selected={grade}
						onSelectedChange={(value) => {
							if (!value) return;
							courseGrades.update((grades) => {
								const newGrades = { ...grades };
								newGrades[course.id] = {
									grade: [value?.value],
									requirementId: requirementId
								};
								return newGrades;
							});
						}}
					>
						<Select.Trigger class="w-24">
							<Select.Value placeholder={grade.value ?? ''} />
						</Select.Trigger>
						<Select.Content class=" max-h-[18rem] overflow-y-auto">
							{#each Object.keys(gradePoints) as grade}
								<Select.Item value={grade}>{grade}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/each}
			</div>
		{/if}
		<Button
			variant="outline"
			hidden={$courseGrades[course.id] && isCompleted($courseGrades[course.id]?.grade)}
			disabled={$courseGrades[course.id] && isCompleted($courseGrades[course.id]?.grade)}
			on:click={() => {
				$selectedCourse = { value: course };
				$dialogRequirementID = requirementId;
				addGradeDialog();
			}}>Enter Grade</Button
		>
	</div>
</div>
