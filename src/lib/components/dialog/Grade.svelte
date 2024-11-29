<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';

	import { gradePoints } from '$lib/types';
	import type { CourseRequirementDetails, Grade } from '$lib/types';
	import { studentCourses as studentGrades } from '$lib/stores/matrix';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(),
		requirementId = $bindable(),
		selectedCourse = $bindable()
	}: {
		open: boolean;
		requirementId: string | undefined;
		selectedCourse: CourseRequirementDetails | undefined;
	} = $props();
	let selectedGrade = $state<string | undefined>(undefined);

	function handleGradeAdd() {
		const courseId = selectedCourse;
		const grade = selectedGrade as Grade;

		if (!courseId) {
			toast.info('Please select a course');
			return;
		}

		if (!grade) {
			toast.info('Please select a grade');
			return;
		}

		addGrade(courseId.id, grade);
		selectedGrade = undefined;
		open = false;
	}
	function addGrade(courseId: string, grade: string, userId: string | null = null) {
		const courseIndex = $studentGrades.findIndex((g) => g.courseId === courseId);

		studentGrades.update((courses) => {
			if (courseIndex !== -1) {
				// Update the existing course
				return courses.map((course, index) =>
					index === courseIndex
						? {
								...course,
								grade: [...course.grade, grade]
							}
						: course
				);
			} else {
				// Add a new course
				return [
					...courses,
					{
						id: crypto.randomUUID(),
						grade: [grade],
						requirementId: requirementId ?? '',
						courseId,
						userId,
						name: ''
					}
				];
			}
		});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>{selectedCourse?.name}</Dialog.Title>
			<Dialog.Description>
				{selectedCourse?.name} - {selectedCourse?.code}
				<div class="flex gap-3 py-4">
					<Select.Root required={true} type="single" bind:value={selectedGrade}>
						<Select.Trigger class="w-[200px]">
							{selectedGrade || 'Select a grade'}
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{#each Object.keys(gradePoints) as grade}
								<Select.Item value={grade}>{grade}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<Dialog.Close>
						<Button.Root onclick={handleGradeAdd}>Add Grade</Button.Root>
					</Dialog.Close>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
