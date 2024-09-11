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
	import CourseItem from '$lib/components/ProgramMatrix/CourseItem.svelte';
	import PoolRequirementItem from '$lib/components/ProgramMatrix/PoolRequirementPool.svelte';
	import {
		getPoolCourses,
		setPoolCourses,
		updatePoolCourses
	} from '$lib/components/ProgramMatrix/context';
	import Header from '$lib/components/ProgramMatrix/header.svelte';
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
		requirementCourses,
		totalCourses
	} from '$lib/stores/ProgramMatrix';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { onMount } from 'svelte';

	export let data: PageData;

	// Destructure data
	let { program, degreeCourses, electiveCourses, studentCourses, requirements } = data;

	// Local state
	let dialogOpen = false;
	let currentRequirement: string | null = null;

	onMount(() => {
		totalCredits.set(program.degreeCredits);
		totalCourses.set(program.degreeCourses);
	});

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
			req.courses.forEach((course) => {
				if (studentCourses[course.id]) {
					requirementCourses.update((courses) => [
						...courses,
						course.id.toString().concat(',' + req.id)
					]);
				}
			});
		}
	});

	function addCourse(course: CourseWithPrerequisites, requirementId: string) {
		programCourses.update((courses) => [
			...courses,
			{ ...course, requirementId } as CourseWithRequirement
		]);
		updatePoolCourses(requirementId);
		courseGrades.update((grades) => ({ ...grades, [course.id]: [] }));
		requirementCourses.update((courses) => [
			...courses,
			course.id.toString().concat(',' + requirementId)
		]);
		// completedCourses.update((completed) => ({ ...completed, [course.id]: false }));
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
						$requirementCourses.includes(c.id.toString().concat(currentRequirement ?? ''))
				)
				.reduce((sum, course) => sum + course.credits, 0);
			const selectedCourse = electiveCourses.find((c) => c.id.toString() === selectedCourseId);
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
			.filter(
				(c) =>
					c.id in $courseGrades &&
					$courseGrades[c.id]?.flatMap((g) => g.grade).filter((grade) => !grade?.startsWith('F'))
			)
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
			.filter(
				(c) =>
					c.id in $courseGrades &&
					$courseGrades[c.id]?.flatMap((g) => g.grade).filter((grade) => !grade?.startsWith('F'))
			)
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
			if (courseData.requirementId && !allCourses.some((c) => c.id.toString() === courseId)) {
				const course = electiveCourses.find((c) => c.id.toString() === courseId);
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

		const grades: Record<string, { id: string; grade: Grade | '' }[]> = {};
		const completed: Record<string, boolean> = {};

		allCourses.forEach((course) => {
			const studentCourse = studentCourses[course.id];
			const studentGrades = studentCourse?.grades;

			if (studentGrades) {
				grades[course.id] = studentGrades.map((grade) => ({
					id: grade.id,
					grade: grade.grade
				}));
				completed[course.id] = studentGrades.some(
					(grade) => !!grade && arePrerequisitesMet(course)
				);
			} else {
				grades[course.id] = [];
				completed[course.id] = false;
			}
		});
		const codes = Object.keys(studentCourses);

		codes.forEach((code) => {
			if (code in grades) {
			} else {
				grades[code] = studentCourses[code]?.grades;
			}
		});

		courseGrades.set(grades);
		// completedCourses.set(completed);
	}

	// Form submission handling
	let loading = false;
	let success = false;
	let alertOpen = false;
</script>
