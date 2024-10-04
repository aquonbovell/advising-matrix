<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { RouterOutputs } from '$lib/server/routes/_app';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Progress } from '$lib/components/ui/progress';
	import { derived, writable } from 'svelte/store';
	import { Course } from '$lib/components/matrix';
	import type { Selected } from 'bits-ui';

	import {
		degree as degreeStore,
		completedCredits as completedCreditsStore,
		completedCourses as completedCoursesStore,
		program as programStore,
		studentCourses as studentCoursesStore,
		totalCredits as totalCreditsStore
	} from '$lib/stores/newstudent';

	export let studentCourses: RouterOutputs['students']['getStudentCourses'];
	export let degree: RouterOutputs['students']['getStudentDegree'];
	export let program: RouterOutputs['students']['getStudentProgram'];

	const courseGrades = writable(studentCourses.courses);

	$: courseGrades.set(studentCourses.courses);

	const completedCredits = studentCourses.courses.reduce((acc, course) => {
		if (course.grade && !course.grade.startsWith('F')) {
			return acc + course.credits;
		}
		return acc;
	}, 0);

	const completedCourses = derived(
		courseGrades,
		($courseGrades) =>
			$courseGrades.filter((course) => course.grade && !course.grade.startsWith('F')).length
	);

    const totalCredits = derived(writable(degree), $degree => 
        $degree.degree.requirements.reduce((total, req) => total + req.credits, 0)
    );


	let selectedCourseId: Selected<number>;
	
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-6" transition:fly={{ y: 30, delay: 200 }}>
	<Card.Root>
		<Card.Header class="flex flex-row items-baseline justify-between">
			<Card.Title>{degree.degree.name}</Card.Title>
			<Button.Root variant="outline">Save Changes</Button.Root>
		</Card.Header>
		<Card.Content>
			<div class="flex gap-3 pb-4">
				<Button.Root variant="ghost" type="button">Degree GPA:</Button.Root>
				<Button.Root variant="ghost" type="button">Overall GPA:</Button.Root>
			</div>
			<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
				<Progress value={completedCredits} max={$totalCredits} class="h-3" />
				<p class="w-fit">{completedCredits} / {$totalCredits} Credits</p>
			</div>
		</Card.Content>
	</Card.Root>
	{#each degree.degree.requirements as req}
		<Card.Root>
			<Card.Header class="flex flex-row items-baseline justify-between">
				<Card.Title
					>{`Level ${req.level === 4 ? '2 / 3' : req.level} - ${req.credits} credits`}</Card.Title
				>
			</Card.Header>
			<Card.Content class="px-0">
				<ul class="divide-y-2">
					{#each req.details as course}
						<Course
							{course}
							required={req.type === 'POOL' ? false : true}
							requirementId={req.id}
							addGradeDialog={() => {}}
						/>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}

	<h1>Test</h1>
	<p>Student Courses: {studentCourses.courses.length}</p>
	<p>Degree: {degree.degree.name}</p>
	<p>Program: {program.program.id}</p>
	<p>Completed Credits: {completedCredits}</p>
	<p>Completed Courses: {$completedCourses}</p>
</div>

<!-- <Dialog.Root>
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
						value && (selectedCourseId = value);
					}}
				>
					<Select.Trigger class="w-[340px]">
						<Select.Value placeholder="Select A course" />
					</Select.Trigger>
					<Select.Content class="max-h-60 overflow-auto">
						{@const requirement = degree.degree.requirements}
						{#if requirement}
							{#each requiremendetails as course}
								<Select.Item value={course.id}>{course.code} - {course.name}</Select.Item>
							{/each}
						{:else}
							<Select.Item value="No courses found" disabled>No courses found</Select.Item>
						{/if}
					</Select.Content>
				</Select.Root>
			</div>
		</Dialog.Description>
	</Dialog.Header>
</Dialog.Root> -->
