<script lang="ts">
	import * as Button from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { TrashIcon } from 'lucide-svelte';
	import { selectedCourse, studentCourses } from '$lib/stores/matrix';
	import { gradePoints } from '$lib/types';
	import type { CourseRequirementDetails, StudentCourse } from '$lib/types';
	import {
		cn,
		isCourseCompleted,
		arePrerequisitesMet,
		requiredCourses,
		isValidCourse
	} from '$lib/utils';

	let {
		course,
		required,
		addGradeDialog
	}: { course: CourseRequirementDetails; required: boolean; addGradeDialog: () => void } = $props();

	let currentCourse = $state<StudentCourse | undefined>(undefined);

	studentCourses.subscribe((courses) => {
		currentCourse = courses.find((c) => c.courseId === course.id);
	});
	let isComplete = $derived(isCourseCompleted(currentCourse));

	let statusColor = !arePrerequisitesMet(course)
		? 'bg-red-50 border-red-100'
		: 'bg-white hover:bg-gray-50';

	function handleGradeDialogOpen() {
		selectedCourse.set(course);
		addGradeDialog();
	}

	// function arePrerequisitesMet(course: CourseDetails) {
	// 	return course.prerequisites.every((prerequisite) =>
	// 		$studentCourses.some((c) => c.courseId === prerequisite)
	// 	);
	// 	throw new Error('Function not implemented.');
	// }
</script>

<div
	class={cn(
		'group relative border-y transition-all duration-200 @container',

		statusColor
	)}
>
	<div
		class="grid flex-col gap-4 p-4 @md:grid-cols-6 sm:flex-row sm:items-start sm:justify-between"
	>
		<div class="flex-grow space-y-2 @md:col-span-4 @xl:col-span-3">
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2">
					{#if !required}
						<Button.Root
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-red-500 "
							onclick={() => {
								const currentCourseIndex = $studentCourses.findIndex(
									(c) => c.courseId === course.id
								);
								if (currentCourseIndex !== -1) {
									studentCourses.update((courses) => [
										...courses.slice(0, currentCourseIndex),
										...courses.slice(currentCourseIndex + 1)
									]);
								}
							}}
						>
							<TrashIcon class="h-4 w-4" />
						</Button.Root>
					{/if}
					<h3 class="text-sm font-medium text-gray-900">
						{course.code} - {course.id}
					</h3>
				</div>
				<span class="text-gray-500">•</span>
				<p class="text-sm text-gray-600">{course.name}</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Badge variant="secondary" class="text-xs">Level {course.level}</Badge>
				<Badge variant="secondary" class="bg-green-100 text-green-700 hover:bg-green-200">
					{course.credits} credits
				</Badge>
				{#if !arePrerequisitesMet(course)}
					<div class="flex gap-1">
						{#each requiredCourses(course) as code}
							<Badge variant="destructive" class="text-xs">
								{code}
							</Badge>
						{/each}
						{#if course.restrictions.length > 0}
							{#each course.restrictions as level}
								<Badge variant="destructive" class="w-max text-xs">
									{level.credits} credits from level {level.level.join(' / ')}
									{level.area.join(',')}
								</Badge>
							{/each}
						{/if}
					</div>
				{/if}
				<!-- {#if currentCourse?.name}
					<Badge variant="secondary">Suggested by: {currentCourse?.name}</Badge>
				{/if} -->
			</div>
		</div>
		<div class="flex w-full flex-wrap items-center gap-3 @md:col-span-2 @xl:col-span-3">
			{#if !isCourseCompleted(currentCourse)}
				<Button.Root
					variant="outline"
					size="sm"
					class="whitespace-nowrap"
					onclick={handleGradeDialogOpen}
				>
					Enter grade
				</Button.Root>
			{/if}
			{#if currentCourse?.grade}
				{#each currentCourse.grade as grade, index}
					<div class="flex flex-wrap items-center gap-2">
						<Select.Root required bind:value={currentCourse.grade[index]} type="single">
							<Select.Trigger class="h-8 w-20 bg-white">{grade ?? 'GRade'}</Select.Trigger>
							<Select.Content>
								{#each Object.keys(gradePoints) as grade}
									<Select.Item value={grade} class="text-sm">
										{grade}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/each}
			{/if}
		</div>
		<!-- {#if metRequirements && course?.prerequisites}
			<div class="col-span-full flex flex-wrap gap-2">
				{#each course?.prerequisites as prerequisite}
					<Badge variant="destructive">{prerequisite.code}</Badge>
				{/each}
			</div>
		{/if} -->
		{#if course?.comment}
			<Badge variant="outline" class="col-span-full w-fit">{course?.comment}</Badge>
		{/if}
	</div>
	<div
		class={cn(
			'absolute left-0 top-0 h-full w-1 transition-colors',
			isComplete
				? 'bg-green-500'
				: !arePrerequisitesMet(course)
					? 'bg-red-400'
					: isValidCourse(currentCourse)
						? 'bg-yellow-400'
						: 'bg-gray-200'
		)}
	></div>
</div>
