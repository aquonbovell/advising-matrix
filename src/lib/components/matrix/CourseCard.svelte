<script lang="ts">
	import * as Button from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { TrashIcon } from 'lucide-svelte';
	import { studentCourses, isCourseCompleted, selectedCourse } from '$lib/stores/newstudent';
	import { gradePoints } from '$lib/types';
	import type { CourseWithPrerequisites } from '$lib/types';
	import { arePrerequisitesMet, cn, requiredCourses } from '$lib/utils';

	export let course: CourseWithPrerequisites;
	export let required: boolean = true;
	export let addGradeDialog: () => void;

	$: currentCourse = $studentCourses.find((c) => c.courseId === course.id);
	$: isComplete = currentCourse && isCourseCompleted(currentCourse);

	$: statusColor = !arePrerequisitesMet(course)
		? 'bg-red-50 border-red-100'
		: 'bg-white hover:bg-gray-50';

	function handleGradeDialogOpen() {
		selectedCourse.set({ value: course });
		addGradeDialog();
	}
</script>

<div
	class={cn('group relative border transition-all duration-200', 'overflow-hidden', statusColor)}
>
	<div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex-grow space-y-2">
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2">
					{#if !required}
						<Button.Root
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-red-500 "
							on:click={() => {
								const index = $studentCourses.findIndex((c) => c.courseId === course.id);
								if (index !== -1) {
									studentCourses.update((courses) => [
										...courses.slice(0, index),
										...courses.slice(index + 1)
									]);
								}
							}}
						>
							<TrashIcon class="h-4 w-4" />
						</Button.Root>
					{/if}
					<h3 class="text-sm font-medium text-gray-900">
						{course.code}
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
					</div>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-3">
			{#if currentCourse?.grade}
				<div class="flex items-center gap-2">
					<Select.Root
						required={true}
						selected={{ value: currentCourse.grade, label: currentCourse.grade }}
						onSelectedChange={(value) => {
							if (!value?.value) return;
							studentCourses.update((courses) =>
								courses.map((c) => (c.courseId === course.id ? { ...c, grade: value.value } : c))
							);
						}}
					>
						<Select.Trigger class="h-8 w-20 bg-white">
							<Select.Value placeholder="Grade" />
						</Select.Trigger>
						<Select.Content>
							{#each Object.keys(gradePoints) as grade}
								<Select.Item value={grade} class="text-sm">
									{grade}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			{:else}
				<Button.Root
					variant="outline"
					size="sm"
					class="whitespace-nowrap"
					disabled={!arePrerequisitesMet(course)}
					on:click={handleGradeDialogOpen}
				>
					Enter Grade
				</Button.Root>
			{/if}
		</div>
	</div>
	<div
		class={cn(
			'absolute left-0 top-0 h-full w-1 transition-colors',
			isComplete
				? 'bg-green-500'
				: !arePrerequisitesMet(course)
					? 'bg-red-400'
					: currentCourse?.grade
						? 'bg-yellow-400'
						: 'bg-gray-200'
		)}
	/>
</div>
