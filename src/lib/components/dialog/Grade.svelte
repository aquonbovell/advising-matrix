<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';

	import { gradePoints } from '$lib/types';
	import type { Grade, NonNullableGrade } from '$lib/types';
	import type { Selected } from 'bits-ui';
	import { studentCourses as studentGrades, degree } from '$lib/stores/matrix';

	let {
		open,
		requirementId,
		selectedCourse
	}: { open: boolean; requirementId: string | undefined; selectedCourse: string } = $props();
	let selectedGrade = $state('');

	function handleGradeAdd() {
		const courseId = selectedCourse;
		const grade = selectedGrade;

		// if (!courseId || !grade) {
		// 	toastState.add('Error', 'Please select a course and grade', 'error');
		// 	return;
		// }

		// if (!isGrade(selectedGrade.value)) {
		// 	toastState.add('Error', 'Invalid grade selected', 'error');
		// 	return;
		// }

		addCourseGrade(courseId, grade);
		// selectedGrade = { value: undefined, label: '' };
		selectedGrade = '';
		open = false;
	}
	function addCourseGrade(courseId: string, grade: string, userId: string | null = null) {
		const requirementIndex = $degree.requirements.findIndex((r) => r.id === requirementId);
		console.log(requirementIndex);

		if (requirementIndex === -1) {
			return;
		}

		if (!selectedCourse) {
			return;
		}
		let credits = 0;

		const requirement = $degree.requirements[requirementIndex];
		const course = requirement.courses.find((c) => c.id === courseId);
		console.log(course);

		if (!course) {
			return;
		}

		studentGrades.update((grades) => [
			...grades,
			{
				id: crypto.randomUUID(),
				studentId: userId,
				grade: '',
				requirementId: requirementId || '',
				courseId: courseId,
				userId: userId
			}
		]);
	}

	function handleClose() {
		selectedGrade = '';
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (isOpen) {
			handleClose();
		}
	}}
>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>$selectedCourse.value?.code</Dialog.Title>
			<Dialog.Description>
				$selectedCourse.value?.name
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
