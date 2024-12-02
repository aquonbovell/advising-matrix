<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';
	import { degree, studentCourses as studentGrades } from '$lib/stores/matrix';

	let {
		open = $bindable(),
		dialogRequirementID,
		selectedCourseId
	}: {
		open: boolean;
		dialogRequirementID: string | undefined;
		selectedCourseId: string[];
	} = $props();
	function addCourse(selectedCourseIds: string[], userId: string | null = null) {
		const requirementIndex = $degree.requirements.findIndex((r) => r.id === dialogRequirementID);
		console.log(requirementIndex);

		if (requirementIndex === -1) {
			return;
		}

		if (selectedCourseIds.length === 0) {
			return;
		}
		let credits = 0;

		const requirement = $degree.requirements[requirementIndex];
		for (let courseId of selectedCourseIds) {
			const course = requirement.courses.find((c) => c.id === courseId);
			console.log(course);

			if (!course) {
				return;
			}

			if (credits >= requirement.credits) {
				break;
			}

			credits += course.credits;

			studentGrades.update((grades) => [
				...grades,
				{
					id: crypto.randomUUID(),
					grade: [],
					requirementId: dialogRequirementID ?? '',
					courseId: courseId,
					userId: userId,
					name: ''
				}
			]);
		}

		selectedCourseId = [];
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>Select a course</Dialog.Title>
			<Dialog.Description>
				<p class="pb-4">
					Select a course from the list below to add. The course will be added to your list of
					courses.
				</p>
				<div class="flex flex-col gap-3 md:flex-row">
					<Select.Root required={true} type="multiple" bind:value={selectedCourseId}>
						<Select.Trigger class="w-72 md:w-80">
							{@const index = $degree.requirements.findIndex((r) => r.id === dialogRequirementID)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#if requirement.courses.filter( (course) => selectedCourseId.includes(course.id) ).length > 0}
									{requirement.courses
										.filter((course) => selectedCourseId.includes(course.id))
										.map((c) => c.name)
										.join(', ')}
								{:else}
									Select a course
								{/if}
							{:else}
								Select a course
							{/if}
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{@const index = $degree.requirements.findIndex((r) => r.id === dialogRequirementID)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#each requirement.courses
									.filter((c) => !$studentGrades.some((sg) => sg.courseId === c.id) && !$degree.requirements
												.filter((r) => r.option === 'ALL')
												.some((r) => r.details.some((detail) => detail === c.id)))
									.sort((a, b) => {
										if (a.code < b.code) {
											return -1;
										}
										if (a.code > b.code) {
											return 1;
										}
										return 0;
									}) as course}
									<Select.Item value={course.id}>{course.code} - {course.name}</Select.Item>
								{/each}
							{:else}
								<Select.Item value="No courses found" disabled>No courses found</Select.Item>
							{/if}
						</Select.Content>
					</Select.Root>
					<Dialog.Close
						onclick={() => {
							addCourse(selectedCourseId);
							open = false;
						}}><Button.Root>Add Course</Button.Root></Dialog.Close
					>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
