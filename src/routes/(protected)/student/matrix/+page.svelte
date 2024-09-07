<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import UIButton from '$lib/components/UIButton.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import {
		gradePoints,
		type CourseWithPrerequisites,
		type CourseWithRequirement,
		type Grade
	} from '$lib/types';
	import type { PageData } from './$types';

	import Modal from '$lib/components/ui/Modal.svelte';
	import CourseItem from '$lib/components/degreeTracker/CourseItem.svelte';
	import PoolRequirementItem from '$lib/components/degreeTracker/PoolRequirementPool.svelte';
	import {
		getPoolCourses,
		setPoolCourses,
		updatePoolCourses
	} from '$lib/components/degreeTracker/context';
	import Header from '$lib/components/degreeTracker/header.svelte';
	import DangerIcon from '$lib/components/icons/DangerIcon.svelte';
	import TickIcon from '$lib/components/icons/TickIcon.svelte';
	import LoadingIcon from '$lib/components/icons/LoadingIcon.svelte';
	import { arePrerequisitesMet } from '$lib/utils';
	import {
		appliedCredits,
		completedCourses,
		courseGrades,
		gpa,
		inProgress,
		programCourses,
		totalCredits,
		stillNeeded,
		complete,
		progressPercentage,
		poolCourses,
		requirementCourses
	} from '$lib/stores/degreeTracker';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { onMount } from 'svelte';

	export let data: PageData;

	// Destructure data
	let { program, degreeCourses, electiveCourses, studentCourses, requirements } = data;

	// Local state
	let dialogOpen = false;
	let currentRequirement: string | null = null;

	onMount(() => totalCredits.set(program.degreeCredits));

	// Pool courses
	$: program.requirementsWithCourses.forEach((req) => {
		if (req.type === 'POOL' && req.credits > 0) {
			setPoolCourses(
				req.id,
				req?.courses.map((course: CourseWithPrerequisites) => ({
					...course,
					requirementId: req.id
				}))
			);
		}
	});

	function addCourse(course: CourseWithPrerequisites, requirementId: string) {
		programCourses.update((courses) => [
			...courses,
			{ ...course, requirementId } as CourseWithRequirement
		]);
		updatePoolCourses(requirementId);
		courseGrades.update((grades) => ({ ...grades, [course.id]: '' }));
		requirementCourses.update((courses) => [...courses, course.id.concat(requirementId)]);
		completedCourses.update((completed) => ({ ...completed, [course.id]: false }));
		dialogOpen = false;
	}

	function handleAddCourse() {
		const courseElement = document.getElementById('course') as HTMLSelectElement | null;
		const selectedCourseId = courseElement?.value;
		if (selectedCourseId && currentRequirement) {
			const currentCredits = $poolCourses
				.filter(
					(c) =>
						c.id in $completedCourses &&
						$requirementCourses.includes(c.id.concat(currentRequirement ?? ''))
				)
				.reduce((sum, course) => sum + course.credits, 0);
			const selectedCourse = electiveCourses.find((c) => c.id === selectedCourseId);
			const requirementCredits =
				requirements?.find((req) => req.id === currentRequirement)?.credits ?? 0;
			if (currentCredits + selectedCourse!.credits > requirementCredits) {
				dialogOpen = false;
				alertOpen = true;
				return;
			}
			if (selectedCourse) addCourse(selectedCourse, currentRequirement);
		}
	}

	function openAddCourseModal(requirementId: string) {
		currentRequirement = requirementId;
		console.log(requirementId);
		getPoolCourses(requirementId)?.subscribe((courses) => {
			poolCourses.set(courses);
		});
		dialogOpen = true;
	}

	$: level1requiredcredits = program.requirements
		.filter((req) => req.level === 1)
		.reduce((acc, req) => {
			return acc + req.credits;
		}, 0);

	$: islevel1completed =
		level1completedcredits
			.filter((c) => c.id in $courseGrades && $courseGrades[c.id] !== '')
			.reduce((acc, c) => {
				return acc + c.credits;
			}, 0) >= level1requiredcredits;

	$: level1completedcredits = [
		...degreeCourses
			.filter((c) => c.code[4] === '1')
			.map((c) => {
				return { id: c.id, credits: c.credits };
			}),
		...program.requirementsWithCourses
			.filter((req) => req.level === 1)
			.flatMap((req) => {
				return req.courses.map((course) => {
					return { id: course.id, credits: course.credits };
				});
			})
	];
	$: level2requiredcredits = program.requirements
		.filter((req) => req.level === 2)
		.reduce((acc, req) => {
			return acc + req.credits;
		}, 0);

	$: islevel2completed =
		level2completedcredits
			.filter((c) => c.id in $courseGrades && $courseGrades[c.id] !== '')
			.reduce((acc, c) => {
				return acc + c.credits;
			}, 0) >= level2requiredcredits;

	$: level2completedcredits = [
		...degreeCourses
			.filter((c) => c.code[4] === '2')
			.map((c) => {
				return { id: c.id, credits: c.credits };
			}),
		...program.requirementsWithCourses
			.filter((req) => req.level === 2)
			.flatMap((req) => {
				return req.courses.map((course) => {
					return { id: course.id, credits: course.credits };
				});
			})
	];

	// Reactive statements
	$: if (programCourses) {
		programCourses.set(degreeCourses.map((course) => ({ ...course, requirementId: null })));
	}

	$: if (programCourses && studentCourses) {
		const allCourses: CourseWithRequirement[] = degreeCourses.map((course) => ({
			...course,
			requirementId: null
		}));

		Object.entries(studentCourses).forEach(([courseId, courseData]) => {
			if (courseData.requirementId && !allCourses.some((c) => c.id === courseId)) {
				const course = electiveCourses.find((c) => c.id === courseId);
				if (course) {
					allCourses.push({
						...course,
						requirementId: courseData.requirementId,
						prerequisites: []
					});
				}
			}
		});

		programCourses.set(allCourses);

		const grades: Record<string, Grade | ''> = {};
		const completed: Record<string, boolean> = {};

		allCourses.forEach((course) => {
			const studentCourse = studentCourses[course.id];
			const grade = studentCourse?.grade;
			grades[course.id] = (grade && grade in gradePoints ? grade : '') as Grade | '';
			completed[course.id] = !!grade && arePrerequisitesMet(course);
		});

		courseGrades.set(grades);
		completedCourses.set(completed);
	}

	// Form submission handling
	let loading = false;
	let success = false;
	let alertOpen = false;
</script>

<!-- Header -->
<Header degreeName={data.program.name} {islevel1completed} {islevel2completed} />

<h2 class="my-2 text-xl font-semibold">Course Requirements</h2>

<div class="grid items-center justify-between gap-y-4 md:grid-cols-12">
	<div class="flex flex-wrap items-center gap-3 md:col-span-8">
		<UIButton class="bg-blue-700 hover:bg-blue-500">All Courses</UIButton>
		<UIButton class="bg-red-500  hover:bg-red-400">
			<DangerIcon />
			Still Needed ({$stillNeeded})
		</UIButton>
		<UIButton class="bg-amber-500 hover:bg-amber-300">
			<LoadingIcon />
			In Progress ({$inProgress})
		</UIButton>
		<UIButton class="bg-green-600 hover:bg-green-400">
			<TickIcon />
			Complete ({$complete})
		</UIButton>
	</div>

	<div class="flex w-full flex-col items-end md:col-span-4">
		<div class="mb-1 text-sm text-gray-600">
			{$appliedCredits}/{$totalCredits} Credits Applied
		</div>
		<div class="min-w-full">
			<ProgressBar progress={$progressPercentage} size="sm" />
		</div>
	</div>
</div>

<form
	method="POST"
	action="?/saveChanges"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			success = true;
			loading = false;
			setTimeout(() => {
				success = false;
			}, 3000);
		};
	}}
>
	<h1 class="my-3 text-2xl font-bold">Courses for {program.name}</h1>

	<h2 class="mb-2 text-xl font-bold">
		Level 1 Core {degreeCourses
			.filter((course) => course.code[4] === '1')
			.reduce((sum, course) => sum + course.credits, 0)} Credits {level1requiredcredits}
	</h2>
	<div class="rounded-lg bg-white shadow">
		<ul class="divide-y divide-gray-200">
			{#each degreeCourses.filter((course) => course.code[4] === '1') as course (course.id)}
				<CourseItem {course} />
			{/each}
		</ul>
	</div>
	<div class="my-3 rounded-lg bg-white shadow">
		<ul class="divide-y divide-gray-200">
			{#each requirements as req}
				{#if req.type === 'POOL' && req.credits > 0 && req.level === 1}
					<PoolRequirementItem requirement={req} onAddCourse={openAddCourseModal} />
				{/if}
			{/each}
		</ul>
	</div>
	{#if islevel1completed}
		<h2 class="mb-2 text-xl font-bold">
			Level 2 Core {degreeCourses
				.filter((course) => course.code[4] === '2')
				.reduce((sum, course) => sum + course.credits, 0)} Credits
		</h2>
		<div class="rounded-lg bg-white shadow">
			<ul class="divide-y divide-gray-200">
				{#each degreeCourses.filter((course) => course.code[4] === '2') as course (course.id)}
					<CourseItem {course} />
				{/each}
			</ul>
		</div>

		<div class="my-3 rounded-lg bg-white shadow">
			<ul class="divide-y divide-gray-200">
				{#each requirements as req}
					{#if req.type === 'POOL' && req.credits > 0 && req.level === 2}
						<PoolRequirementItem requirement={req} onAddCourse={openAddCourseModal} />
					{/if}
				{/each}
			</ul>
		</div>

		<h2 class="mb-2 text-xl font-bold">
			Level 3 Core {degreeCourses
				.filter((course) => course.code[4] === '3')
				.reduce((sum, course) => sum + course.credits, 0)} Credits
		</h2>
		<div class="rounded-lg bg-white shadow">
			<ul class="divide-y divide-gray-200">
				{#each degreeCourses.filter((course) => course.code[4] === '3') as course (course.id)}
					<CourseItem {course} />
				{/each}
			</ul>
		</div>

		<div class="my-3 rounded-lg bg-white shadow">
			<ul class="divide-y divide-gray-200">
				{#each requirements as req}
					{#if req.type === 'POOL' && req.credits > 0 && req.level === 3}
						<PoolRequirementItem requirement={req} onAddCourse={openAddCourseModal} />
					{/if}
				{/each}
			</ul>
		</div>

		<div class="my-3 rounded-lg bg-white shadow">
			<ul class="divide-y divide-gray-200">
				{#each requirements as req}
					{#if req.type === 'POOL' && req.credits > 0 && req.level === null}
						<PoolRequirementItem requirement={req} onAddCourse={openAddCourseModal} />
					{/if}
				{/each}
			</ul>
		</div>
	{/if}
	<AlertDialog.Root bind:open={alertOpen}>
		<!-- <AlertDialog.Trigger>Open</AlertDialog.Trigger> -->
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be done. This will exceed your credits for this selection. Unless you
					remove a course, you cannot add another.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action>Continue</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	<Modal title="Add Elective Course" bind:open={dialogOpen}>
		<select
			name="course"
			id="course"
			class="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
		>
			<option value="">Select a course...</option>
			{#each $poolCourses.filter((c) => !(c.id in $completedCourses && $requirementCourses.filter( (el) => el.startsWith(c.id) ))) as course}
				<option value={course.id}>{course.code} - {course.name}</option>
			{/each}
		</select>
		<svelte:fragment slot="footer">
			<Button on:click={() => (dialogOpen = false)}>Close</Button>
			<Button on:click={handleAddCourse}>Add Course</Button>
		</svelte:fragment>
	</Modal>

	<div class="mt-6 text-xl font-bold">
		Overall GPA: {$gpa}
	</div>

	<div class="mt-6">
		<Button type="submit" {loading}>Save Changes</Button>
		{#if loading}
			<span class="ml-2 text-sm">Saving...</span>
		{/if}
		{#if success}
			<span class="ml-2 text-sm text-green-500">Changes saved successfully</span>
		{/if}
	</div>

</form>