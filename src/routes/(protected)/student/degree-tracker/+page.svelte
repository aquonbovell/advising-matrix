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
	import { derived, get, writable } from 'svelte/store';
	import type { PageData } from './$types';
	import type { Course } from '$lib/db/schema';

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
		progressPercentage
	} from '$lib/stores/degreeTracker';

	export let data: PageData;

	// Destructure data
	let { program, degreeCourses, electiveCourses, studentCourses, requirements } = data;

	// Local state
	let dialogOpen = false;
	let currentRequirement: string | null = null;

	// Pool courses
	$: requirements.forEach((req) => {
		if (req.type === 'POOL' && req.credits > 0) {
			console.log(req.id);
			setPoolCourses(
				req.id,
				$programCourses.filter((course) => course.requirementId === req.id)
			);
		}
	});

	function addCourse(course: CourseWithPrerequisites, requirementId: string) {
		programCourses.update((courses) => [
			...courses,
			{ ...course, requirementId } as CourseWithRequirement
		]);
		console.log(requirementId);
		updatePoolCourses(requirementId, { ...course, requirementId });
		courseGrades.update((grades) => ({ ...grades, [course.id]: '' }));
		completedCourses.update((completed) => ({ ...completed, [course.id]: false }));
		dialogOpen = false;
	}

	function handleAddCourse() {
		const courseElement = document.getElementById('course') as HTMLSelectElement | null;
		const selectedCourseId = courseElement?.value;
		if (selectedCourseId && currentRequirement) {
			const selectedCourse = electiveCourses.find((c) => c.id === selectedCourseId);
			if (selectedCourse) addCourse(selectedCourse, currentRequirement);
		}
	}

	function openAddCourseModal(requirementId: string) {
		currentRequirement = requirementId;
		dialogOpen = true;
	}

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
</script>

<!-- Header -->
<!-- {JSON.stringify(
	degreeCourses.filter((course) => course.code[4] === '1'),
	null,
	2
)} -->
<Header degreeName={data.program.name} />

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

	<h2 class="mb-2 text-xl font-bold">Level 1 Core</h2>
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
				{#if req.type === 'POOL' && req.credits > 0}
					<PoolRequirementItem
						requirement={req}
						courses={getPoolCourses(req.id)}
						onAddCourse={openAddCourseModal}
					/>
				{/if}
			{/each}
		</ul>
	</div>

	<Modal title="Add Elective Course" bind:open={dialogOpen}>
		<select
			name="course"
			id="course"
			class="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
		>
			<option value="">Select a course...</option>
			{#each electiveCourses.filter((electiveCourse) => $programCourses.findIndex((poolCourse) => poolCourse.id == electiveCourse.id) === -1) as course}
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
