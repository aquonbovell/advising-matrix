<script lang="ts">
	import TrashIcon from 'lucide-svelte/icons/trash';
	import * as Button from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { UserRole, type CourseRequirementDetails, type Grade } from '$lib/types';
	import type { Selected } from 'bits-ui';
	import { isCourseCompleted } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';
	import { studentCourses } from '$lib/stores/matrix';

	let {
		course,
		required,
		role
	}: {
		course: CourseRequirementDetails;
		required: boolean;
		role: UserRole;
	} = $props();

	let processedGrades = [] as Selected<Grade>[];

	let currentCourse = $studentCourses.find((c) => c.courseId === course.id);

	// // Reactive block that responds to changes in courseGrades
	// $: {
	// 	// Reset processed grades on each re-run
	// 	processedGrades = [];

	// 	const grades = $courseGrades[course.id]?.grade ?? [];

	// 	for (let g of grades) {
	// 		let grade: Selected<Grade> = { value: g as unknown as Grade }; // Cast string to Grade
	// 		processedGrades.push(grade);
	// 	}
	// }

	// let styles = '';

	// $effect(() => {
	// 	if (
	// 		($studentCourses.find((sc) => sc.courseId === course?.id)?.grade.length! > 0 &&
	// 			required &&
	// 			isCourseCompleted($studentCourses.find((sc) => sc.courseId === course?.id))) ||
	// 		(!required && isCourseCompleted($studentCourses[course.id]))
	// 	) {
	// 		styles = 'bg-green-500';
	// 	} else if (
	// 		(!$studentCourses[course.id] && required) ||
	// 		($studentCourses[course.id] && !required)
	// 	) {
	// 		styles = 'bg-amber-500';
	// 	}
	// });

	let styles = $state('');
</script>

<li class="@container border-t-2 px-4">
	<div class="@xl:flex-row flex flex-col justify-between gap-4 py-4">
		<div class="flex gap-4">
			<Badge class={`w-0 ${styles} hover:${styles} self-center border-0 p-1.5 `}></Badge>
			<div class="flex flex-col gap-1">
				<small class="text-base">{course.code} - {course.name}</small>
				<div class={`flex flex-wrap items-center gap-2`}>
					<!-- {#if $courseGrades[course.id]?.name}
						<Badge variant="secondary" class="bg-gray-200 px-2 text-gray-600"
							>Suggested by: {$courseGrades[course.id]?.name}</Badge
						>
					{/if} -->
					{#if !required}
						<Button.Root
							variant="ghost"
							class="p-2 text-red-500 hover:text-red-600"
							onclick={() => {
								const index = $studentCourses.findIndex((c) => c.courseId === course.id);
								if (index !== -1) {
									studentCourses.update((courses) => [
										...courses.slice(0, index),
										...courses.slice(index + 1)
									]);
								}
							}}><TrashIcon class={'w-4'} /></Button.Root
						>
					{/if}
					<Badge variant="secondary">Level: {course.level}</Badge>
					<Badge class=" bg-green-200 px-2 text-green-600	hover:bg-green-200" variant="secondary"
						>{course.credits} credits</Badge
					>
				</div>
			</div>
		</div>

		<div class="@xl:flex-row-reverse flex flex-col gap-4">
			<div class="flex max-w-[22rem] flex-row flex-wrap gap-2">
				<!-- {#if $studentCourses.find((sc) => sc.courseId === course.id)?.grade}
					{#each $studentCourses
						.find((sc) => sc.courseId === course.id)
						?.grade.split(',') ?? [] as grade}
						<Select.Root required={true} type="single">
							<Select.Trigger class="w-20">
								{grade ?? ''}
							</Select.Trigger>
						</Select.Root>
					{/each}
				{/if} -->
			</div>
		</div>
	</div>
</li>
