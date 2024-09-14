<script lang="ts">
	import { courseGrades, dialogRequirementID, selectedCourse } from '$lib/stores/student';
	import TrashIcon from 'lucide-svelte/icons/trash';
	import * as Button from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { gradePoints, type CourseWithPrerequisites, type Grade } from '$lib/types';
	import type { Selected } from 'bits-ui';
	import { arePrerequisitesMet, isCompleted, requiredCourses } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';
	export let course: CourseWithPrerequisites;
	export let required: boolean = true;
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

<li class=" px-7">
	<div class="flex flex-col justify-between gap-4 py-4 lg:flex-row">
		<div>
			<div class="flex items-center gap-3">
				<Badge class={`w-1 ${styles} hover:${styles}`}>&nbsp;</Badge>
				<small class="text-base">{course.code} - {course.name}</small>
			</div>
			<div class={`flex items-center ${!required ? '' : 'pl-8'}`}>
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
				<div class="flex gap-2">
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
							<Select.Trigger class="w-20">
								<Select.Value placeholder={grade.value ?? ''} />
							</Select.Trigger>
							<Select.Content class=" max-h-60 overflow-y-auto">
								{#each Object.keys(gradePoints) as grade}
									<Select.Item value={grade}>{grade}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/each}
				</div>
			{/if}
			<Button.Root
				variant="outline"
				hidden={($courseGrades[course.id] && isCompleted($courseGrades[course.id]?.grade)) ||
					!arePrerequisitesMet(course)}
				disabled={($courseGrades[course.id] && isCompleted($courseGrades[course.id]?.grade)) ||
					!arePrerequisitesMet(course)}
				on:click={() => {
					$selectedCourse = { value: course };
					$dialogRequirementID = requirementId;
					addGradeDialog();
				}}>Enter Grade</Button.Root
			>
		</div>
	</div>
</li>
