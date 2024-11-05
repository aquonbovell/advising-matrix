import type { Courses } from '$lib/db/schema';
import { gradePoints, type Grade } from '$lib/types';
import { isCompleted } from '$lib/utils';
import type { Selected } from 'bits-ui';
import { derived, writable, type Readable } from 'svelte/store';

export const courseGrades = writable<
	Record<
		string,
		{ requirementId: string; grade: Grade[]; userId: string | null; name: string | null }
	>
>({});

export const courses = writable<{ id: string; credits: number; code: string }[]>([]);

export const requiredCourses = writable<{ id: string; credits: number }[]>([]);
export const requirements = writable<string[]>([]);

export const dialogRequirementID = writable<string | null>(null);

export const selectedCourse = writable<Selected<Courses | null>>(undefined);

export const totalCredits = writable<number>(0);
export const totalCourses = writable<number>(0);

export const completedCredits = derived(
	[courseGrades, courses, requirements],
	([$courseGrades, $courses, $requirements]) => {
		return Object.entries($courseGrades).reduce((acc, courseGrade) => {
			if (
				isCompleted(courseGrade[1].grade) &&
				$requirements.includes(courseGrade[1].requirementId)
			) {
				const course = $courses.find((course) => course.id === courseGrade[0]);

				if (course) {
					acc += course.credits;
				} else {
					return acc;
				}
			}
			return acc;
		}, 0);
	}
);

export const completedCourse: Readable<string[]> = derived(
	[courseGrades, courses, requirements],
	([$courseGrades, $courses, $requirements]) => {
		let uniqueCourses: { id: string; credits: number }[] = [];

		$courses.forEach((course) => {
			if (!uniqueCourses.some((uniqueCourse) => uniqueCourse.id === course.id)) {
				uniqueCourses.push(course);
			}
		});
		return uniqueCourses
			.map((course) => {
				const grade = $courseGrades[course.id.toString()]?.grade;
				let courseCompleted: string | undefined = undefined;
				if (
					isCompleted(grade) &&
					$requirements.includes($courseGrades[course.id.toString()]?.requirementId!)
				) {
					courseCompleted = course.id;
				}
				return courseCompleted;
			})
			.filter((course) => course !== undefined);
	}
);

export const completedCourses = derived(
	[courseGrades, courses, requirements],
	([$courseGrades, $courses, $requirements]) => {
		return Object.entries($courseGrades).reduce((acc, course) => {
			if (isCompleted(course[1].grade) && $requirements.includes(course[1].requirementId)) {
				return acc + 1;
			}
			return acc;
		}, 0);
	}
);

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

export const gpa = derived(
	[courseGrades, courses, requirements],
	([$courseGrades, $courses, $requirement]) => {
		let totalGradePoints = 0;
		let totalCredits = 0;

		const studentGrades = Object.entries($courseGrades);

		for (const [courseId, { grade }] of studentGrades) {
			if (grade.length > 0 && $requirement.includes($courseGrades[courseId]?.requirementId!)) {
				totalGradePoints += getGradePoint(
					grade,
					$courses.find((course) => course.id === courseId)?.credits || 0
				);
				totalCredits +=
					($courses.find((course) => course.id === courseId)?.credits || 0) * grade.length;
			}
		}
		// Return GPA as total grade points divided by total credits
		return totalCredits === 0 ? 0 : (totalGradePoints / totalCredits).toFixed(2);
	}
);

export const degreeGPA = derived(
	[courseGrades, courses, requirements],
	([$courseGrades, $courses, $requirements]) => {
		let totalGradePoints = 0;
		let totalCredits = 0;

		const studentGrades = Object.entries($courseGrades);

		for (const [courseId, { grade }] of studentGrades) {
			if (
				grade.length > 0 &&
				!($courses.find((course) => course.id === courseId)?.code[4]! === '1') &&
				$requirements.includes($courseGrades[courseId]?.requirementId!)
			) {
				totalGradePoints += getGradePoint(
					grade,
					$courses.find((course) => course.id === courseId)?.credits || 0
				);
				totalCredits +=
					($courses.find((course) => course.id === courseId)?.credits || 0) * grade.length;
			}
		}

		// Return GPA as total grade points divided by total credits
		return totalCredits === 0 ? 0 : (totalGradePoints / totalCredits).toFixed(2);
	}
);

export function getGradePoint(grades: Grade[], credits: number): number {
	let total = 0;
	for (const grade of grades) {
		if (grade) {
			total += gradePoints[grade] * credits;
		}
	}

	return total;
}
