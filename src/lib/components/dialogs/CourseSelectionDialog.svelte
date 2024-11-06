<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';
	import { studentCourses, degree } from '$lib/stores/newstudent';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import type { Selected } from 'bits-ui';

	export let open = false;
	export let requirementId: string | null;

	const toastState = getToastState();
	let selectedCourseId: Selected<string> = { value: '', label: '' };

	function handleCourseAdd() {
		if (!selectedCourseId.value || !requirementId) {
			toastState.add('Error', 'Please select a course', 'error');
			return;
		}

		// TODO: Check user's eligibility to add course

		studentCourses.update((courses) => [
			...courses,
			{
				courseId: selectedCourseId.value,
				grade: [],
				name: null,
				userId: null,
				requirementId
			}
		]);

		// Add your course addition logic here
		// addCourse(selectedCourseId.value, requirementId);

		selectedCourseId = { value: '', label: '' };
		open = false;
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			selectedCourseId = { value: '', label: '' };
		}
	}}
>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>Select a course</Dialog.Title>
			<Dialog.Description>
				<p class="pb-4">
					Select a course from the list below to add. The course will be added to your list of
					courses.
				</p>
				<div class="flex flex-col gap-3 md:flex-row">
					<Select.Root
						required={true}
						selected={selectedCourseId}
						onSelectedChange={(value) => {
							selectedCourseId = value ?? { value: '', label: '' };
						}}
					>
						<Select.Trigger class="w-72 md:w-80">
							<Select.Value placeholder="Select a course" />
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{@const index = $degree.requirements.findIndex((r) => r.id === requirementId)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#each requirement.courses.filter((course) => !$studentCourses.some((sc) => sc.courseId === course.id) && !$degree.requirements // Not already taken // Not a required course
											.filter((r) => r.option === 'REQUIRED')
											.some((r) => r.courses.some((c) => c.id === course.id))) as course}
									<Select.Item value={course.id}>
										{course.code} - {course.name}
									</Select.Item>
								{/each}
							{:else}
								<Select.Item value={''} disabled>No courses found</Select.Item>
							{/if}
						</Select.Content>
					</Select.Root>

					<Dialog.Close>
						<Button.Root on:click={handleCourseAdd}>Add Course</Button.Root>
					</Dialog.Close>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
