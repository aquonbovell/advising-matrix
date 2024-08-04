<script lang="ts">
	import UIButton from '$lib/components/UIButton.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import {
		gradePoints,
		type CourseWithPrerequisites,
		type CourseWithRequirement,
		type Grade
	} from '$lib/types';
	import type { PageData } from './$types';
	import { setPoolCourses } from '$lib/components/degreeTracker/context';
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
	import AdvisorCourseItem from '$lib/components/degreeTracker/AdvisorCourseItem.svelte';
	import AdvisorPoolRequirementPool from '$lib/components/degreeTracker/AdvisorPoolRequirementPool.svelte';

	export let data: PageData;

	// Destructure data
	let { program, degreeCourses, electiveCourses, studentCourses, requirements } = data;

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
</script>

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
<h1 class="my-3 text-2xl font-bold">Courses for {program.name}</h1>

<h2 class="mb-2 text-xl font-bold">
	Level 1 Core {degreeCourses
		.filter((course) => course.code[4] === '1')
		.reduce((sum, course) => sum + course.credits, 0)} Credits
</h2>
<div class="rounded-lg bg-white shadow">
	<ul class="divide-y divide-gray-200">
		{#each degreeCourses.filter((course) => course.code[4] === '1') as course (course.id)}
			<AdvisorCourseItem {course} />
		{/each}
	</ul>
</div>
<div class="my-3 rounded-lg bg-white shadow">
	<ul class="divide-y divide-gray-200">
		{#each requirements as req}
			{#if req.type === 'POOL' && req.credits > 0 && req.level === 1}
				<AdvisorPoolRequirementPool requirement={req} />
			{/if}
		{/each}
	</ul>
</div>

<h2 class="mb-2 text-xl font-bold">
	Level 2 Core {degreeCourses
		.filter((course) => course.code[4] === '2')
		.reduce((sum, course) => sum + course.credits, 0)} Credits
</h2>
<div class="rounded-lg bg-white shadow">
	<ul class="divide-y divide-gray-200">
		{#each degreeCourses.filter((course) => course.code[4] === '2') as course (course.id)}
			<AdvisorCourseItem {course} />
		{/each}
	</ul>
</div>

<div class="my-3 rounded-lg bg-white shadow">
	<ul class="divide-y divide-gray-200">
		{#each requirements as req}
			{#if req.type === 'POOL' && req.credits > 0 && req.level === 2}
				<AdvisorPoolRequirementPool requirement={req} />
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
			<AdvisorCourseItem {course} />
		{/each}
	</ul>
</div>

<div class="my-3 rounded-lg bg-white shadow">
	<ul class="divide-y divide-gray-200">
		{#each requirements as req}
			{#if req.type === 'POOL' && req.credits > 0 && req.level === 3}
				<AdvisorPoolRequirementPool requirement={req} />
			{/if}
		{/each}
	</ul>
</div>

<div class="my-3 rounded-lg bg-white shadow">
	<ul class="divide-y divide-gray-200">
		{#each requirements as req}
			{#if req.type === 'POOL' && req.credits > 0 && req.level === null}
				<AdvisorPoolRequirementPool requirement={req} />
			{/if}
		{/each}
	</ul>
</div>

<div class="mt-6 text-xl font-bold">
	Overall GPA: {$gpa}
</div>
