<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';

	import { gradePoints, isGrade } from '$lib/types';
	import type { Grade, NonNullableGrade } from '$lib/types';
	import type { Selected } from 'bits-ui';
	import { getToastState } from '../toast/toast-state.svelte';
	import { addCourseGrade, selectedCourse } from '$lib/stores/newstudent';

	export let open = false;
	export let requirementId: string | null;

	const toastState = getToastState();
	let selectedGrade: Selected<Grade> = { value: undefined, label: '' };

	function handleGradeAdd() {
		const courseId = $selectedCourse.value?.id?.toString();
		const grade = selectedGrade.value;

		if (!courseId || !grade) {
			toastState.add('Error', 'Please select a course and grade', 'error');
			return;
		}

		if (!isGrade(selectedGrade.value)) {
			toastState.add('Error', 'Invalid grade selected', 'error');
			return;
		}

		addCourseGrade(courseId, grade, requirementId!);
		selectedGrade = { value: undefined, label: '' };
		open = false;
	}

	function handleClose() {
		selectedGrade = { value: undefined, label: '' };
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
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{$selectedCourse.value?.code}</Dialog.Title>
			<Dialog.Description>
				{$selectedCourse.value?.name}
				<div class="flex gap-3 py-4">
					<Select.Root
						required={true}
						selected={selectedGrade}
						onSelectedChange={(value) => {
							value && (selectedGrade = value);
						}}
					>
						<Select.Trigger class="w-[200px]">
							<Select.Value placeholder="Enter Grade" />
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{#each Object.keys(gradePoints) as grade}
								<Select.Item value={grade}>{grade}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<Dialog.Close>
						<Button.Root on:click={handleGradeAdd}>Add Grade</Button.Root>
					</Dialog.Close>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
