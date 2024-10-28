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
	let selectedCourseId: Selected<number> = { value: 0, label: '' };

	function handleCourseAdd() {
		if (!selectedCourseId.value || !requirementId) {
			toastState.add('Error', 'Please select a course', 'error');
			return;
		}

		// Add your course addition logic here
		// addCourse(selectedCourseId.value, requirementId);

		selectedCourseId = { value: 0, label: '' };
		open = false;
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			selectedCourseId = { value: 0, label: '' };
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
				<div class="flex gap-3">
					<Select.Root
						required={true}
						selected={selectedCourseId}
						onSelectedChange={(value) => {
							selectedCourseId = value ?? { value: 0, label: '' };
						}}
					>
						<Select.Trigger class="w-[340px]">
							<Select.Value placeholder="Select a course" />
						</Select.Trigger>
						<Select.Content class="max-h-60 overflow-y-auto">
							{@const index = $degree.requirements.findIndex((r) => r.id === requirementId)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#each requirement.details.filter((course) => !$studentCourses.some((sc) => sc.courseId === course.id) && !$degree.requirements // Not already taken // Not a required course
											.filter((r) => r.type === 'CREDITS')
											.some((r) => r.details.some((c) => c.id === course.id))) as course}
									<Select.Item value={course.id}>
										{course.code} - {course.name}
									</Select.Item>
								{/each}
							{:else}
								<Select.Item value={0} disabled>No courses found</Select.Item>
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
