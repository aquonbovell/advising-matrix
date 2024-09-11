import type { Course } from '$lib/db/schema';
import type { Grade } from '$lib/types';
import { isCompleted } from '$lib/utils';
import type { Selected } from 'bits-ui';
import { derived, writable } from 'svelte/store';

export const courseGrades = writable<Record<string, { requirementId: string; grade: Grade[] }>>({});

export const courses = writable<{ id: number; credits: number }[]>([]);

export const requiredCourses = writable<{ id: number; credits: number }[]>([]);
export const dialogRequirementID = writable<string | null>(null);

export const selectedCourse = writable<Selected<Course | null>>(undefined);

export const totalCredits = writable<number>(0);
export const totalCourses = writable<number>(0);

export const completedCredits = derived([courseGrades, courses], ([$courseGrades, $courses]) => {
	return Object.entries($courseGrades).reduce((acc, courseGrade) => {
		if (isCompleted(courseGrade[1].grade)) {
			const course = $courses.find((course) => course.id === parseInt(courseGrade[0]));

			if (course) {
				acc += course.credits;
			} else {
				return acc;
			}
		}
		return acc;
	}, 0);
});
export const completedCourses = derived([courseGrades, courses], ([$courseGrades, $courses]) => {
	return Object.values($courseGrades).reduce((acc, { grade }) => {
		if (isCompleted(grade)) {
			return acc + 1;
		}
		return acc;
	}, 0);
});

export const pendingCourses = derived(
	[courseGrades, requiredCourses],
	([$courseGrades, $requiredCourses]) => {
		const requiredCoursesCount = $requiredCourses.reduce((acc, requiredCourse) => {
			if (
				$courseGrades[requiredCourse.id.toString()] &&
				isCompleted($courseGrades[requiredCourse.id.toString()]?.grade)
			) {
				return acc;
			}
			return acc + 1;
		}, 0);
		const electiveCoursesCount = Object.values($courseGrades).reduce((acc, { grade }) => {
			if (isCompleted(grade)) {
				return acc;
			}
			return acc + 1;
		}, 0);
		return requiredCoursesCount + electiveCoursesCount;
	}
);

export const outstandingCourses = derived(
	[completedCourses, pendingCourses, totalCourses],
	([$completedCourses, $pendingCourses, $totalCourses]) => {
		return $totalCourses - $completedCourses - $pendingCourses;
	}
);
