<script lang="ts">
	import {
		courseGrades,
		dialogRequirementID,
		getGradePoint,
		selectedCourse
	} from '$lib/stores/student';
	import TrashIcon from 'lucide-svelte/icons/trash';
	import * as Button from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { gradePoints, type CoursesWithPrerequisites, type Grade } from '$lib/types';
	import type { Selected } from 'bits-ui';
	import { arePrerequisitesMet, isCompleted, requiredCourses } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';
	import type { UserRole } from '$lib/db/schema';
	export let course: CoursesWithPrerequisites;
	export let required: boolean = true;
	export let role: UserRole | undefined;
	export let requirementId: string;
	export let addGradeDialog: () => void;

	let processedGrades = [] as Selected<Grade>[];

	// Reactive block that responds to changes in courseGrades
	$: {
		// Reset processed grades on each re-run
		processedGrades = [];

		const grades = $courseGrades[course.id]?.grade ?? [];

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

<li class="border-t-2 px-4 @container">
	<div class="flex flex-col justify-between gap-4 py-4 @xl:flex-row">
		<div class="flex gap-4">
			<Badge class={`w-0 ${styles} hover:${styles} self-center border-0 p-1.5 `}></Badge>
			<div class="flex flex-col gap-1">
				<small class="text-base">{course.code} - {course.name}</small>
				<div class={`flex flex-wrap items-center gap-2`}>
					{#if $courseGrades[course.id]?.name}
						<Badge variant="secondary" class="bg-gray-200 px-2 text-gray-600"
							>Suggested by: {$courseGrades[course.id]?.name}</Badge
						>
					{/if}
					{#if !required}
						<Button.Root
							variant="ghost"
							class="p-2 text-red-500 hover:text-red-600"
							on:click={() => {
								courseGrades.update((grades) => {
									const newGrades = { ...grades }; // Create a shallow copy of the grades object
									delete newGrades[course.id]; // Delete the grade associated with the course ID
									return newGrades; // Return the updated grades object
								});
							}}><TrashIcon class={'w-4'} /></Button.Root
						>
					{/if}
					<Badge variant="secondary">Level: {course.level}</Badge>
					<Badge class=" bg-green-200 px-2 text-green-600	hover:bg-green-200" variant="secondary"
						>{course.credits} credits</Badge
					>
					{#if !arePrerequisitesMet(course)}
						{#each requiredCourses(course) as code}
							<Badge variant="outline" class="text-red-500">{code}</Badge>
						{/each}
					{/if}
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-4 @xl:flex-row-reverse">
			{#if role === 'STUDENT'}
				<Button.Root
					class="w-fit"
					variant="outline"
					hidden={($courseGrades[course.id] && isCompleted($courseGrades[course.id]?.grade)) ||
						!arePrerequisitesMet(course)}
					disabled={($courseGrades[course.id] && isCompleted($courseGrades[course.id]?.grade)) ||
						!arePrerequisitesMet(course)}
					on:click={() => {
						$selectedCourse = { value: course };
						$dialogRequirementID = requirementId;
						if (role === 'STUDENT') addGradeDialog();
					}}>Enter Grade</Button.Root
				>
			{/if}
			<div class="flex max-w-[22rem] flex-row flex-wrap gap-2">
				{#if $courseGrades[course.id]}
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
										name: '',
										userId: 'userId',
										requirementId: requirementId
									};
									return newGrades;
								});
							}}
						>
							<Select.Trigger class="w-20">
								<Select.Value placeholder={grade.value ?? ''} />
							</Select.Trigger>
							{#if role === 'STUDENT'}
								<Select.Content class=" max-h-60 overflow-y-auto">
									{#each Object.keys(gradePoints) as grade}
										<Select.Item value={grade}>{grade}</Select.Item>
									{/each}
								</Select.Content>
							{/if}
						</Select.Root>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</li>
