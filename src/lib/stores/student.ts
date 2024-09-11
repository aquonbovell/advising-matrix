import type { Course } from '$lib/db/schema';
import { gradePoints, type Grade } from '$lib/types';
import { isCompleted } from '$lib/utils';
import type { Selected } from 'bits-ui';
import { derived, writable, type Readable } from 'svelte/store';

export const courseGrades = writable<Record<string, { requirementId: string; grade: Grade[] }>>({});

export const courses = writable<{ id: number; credits: number, code:string }[]>([]);

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

export const completedCourse: Readable<number[]> = derived([courseGrades, courses], ([$courseGrades, $courses]) => {
	let uniqueCourses:{id: number; credits:number}[] = [];

	$courses.forEach((course) => {
		if (!uniqueCourses.some((uniqueCourse) => uniqueCourse.id === course.id)) {
			uniqueCourses.push(course);
		}
	});
	return uniqueCourses.map((course) => {
		const grade = $courseGrades[course.id.toString()]?.grade;
		let courseCompleted:number | undefined = undefined;
		if (isCompleted(grade)) {
			courseCompleted = course.id!
		}
		return courseCompleted
	}).filter((course) => course !== undefined);
})

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

export const gpa = derived([courseGrades, courses], ([$courseGrades, $courses]) => {
	let totalGradePoints = 0;
	let totalCredits = 0;

	const studentGrades = Object.entries($courseGrades)

	for (const [courseId, { grade }] of studentGrades) {
		if (isCompleted(grade)) {
	
		totalGradePoints += getGradePoint(grade) * ($courses.find((course) => course.id === parseInt(courseId))?.credits || 0);
		totalCredits += $courses.find((course) => course.id === parseInt(courseId))?.credits || 0;
		}
	}
	// Return GPA as total grade points divided by total credits
	return  totalCredits === 0 ? 0 : (totalGradePoints / totalCredits).toFixed(2);
});

export const degreeGPA = derived([courseGrades, courses], ([$courseGrades, $courses]) => {
	let totalGradePoints = 0;
	let totalCredits = 0;

	const studentGrades = Object.entries($courseGrades)

	for (const [courseId, { grade }] of studentGrades) {
		if (isCompleted(grade) && !($courses.find((course) => course.id === parseInt(courseId))?.code[4]! === '1')) {
	
		totalGradePoints += getGradePoint(grade) * ($courses.find((course) => course.id === parseInt(courseId))?.credits || 0);
		totalCredits += $courses.find((course) => course.id === parseInt(courseId))?.credits || 0;
		}
	}
	// Return GPA as total grade points divided by total credits
	return  totalCredits === 0 ? 0 : (totalGradePoints / totalCredits).toFixed(2);
});


function getGradePoint(grade: Grade[]): number {
	// Assuming grade[0] contains the primary grade value (adjust as necessary)
	const gradeValue = grade[grade.length - 1];

	return gradePoints[gradeValue!];
}
