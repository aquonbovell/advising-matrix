import type { Course } from '$lib/db/schema';
import type { RouterOutputs } from '$lib/server/routes/_app';
import { calculateGradePoint, type NonNullableGrade } from '$lib/types';
import type { Selected } from 'bits-ui';
import { derived, get, writable } from 'svelte/store';

type StudentCourse = RouterOutputs['students']['getStudentCourses']['courses'][number];
type StudentDegree = RouterOutputs['students']['getStudentDegree']['degree'];
type StudentProgram = RouterOutputs['students']['getStudentProgram']['program'];

export const studentCourses = writable<StudentCourse[]>([]);
export const degree = writable<StudentDegree>({
	id: '',
	name: '',
	requirements: []
});
export const program = writable<StudentProgram>({
	id: '',
	major_id: '',
	minor_id: null
});
export const selectedCourse = writable<Selected<Course | null>>(undefined);
// Trying to remove this writable
export const dialogRequirementID = writable<string | undefined>(undefined);

const isValidCourse = (course: StudentCourse) => {
	return Boolean(course.grade);
};

export const isCourseCompleted = (course: StudentCourse): boolean => {
	return isValidCourse(course) && !course.grade.startsWith('F');
};

const getCourseCredits = (course: StudentCourse): number => {
	return course.credits;
};

export const completedCredits = derived(studentCourses, ($studentCourses) =>
	$studentCourses.reduce((total, course) => {
		if (isCourseCompleted(course)) {
			const courseCredits = course ? getCourseCredits(course) : 3;
			return total + courseCredits;
		}
		return total;
	}, 0)
);

export const completedCourses = derived(
	studentCourses,
	($studentCourses) => $studentCourses.filter(isCourseCompleted).length
);

export const totalCredits = derived(degree, ($degree) =>
	$degree.requirements.reduce((total, req) => total + req.credits, 0)
);

// export const overallGPA = derived([studentCourses, degree], ([$courses, $degree]) => {
// 	const completedCourses = $courses.filter(isCourseCompleted);
// 	if (completedCourses.length === 0) return 0;

// 	let totalPoints = 0;
// 	let totalCredits = 0;

// 	completedCourses.forEach((course) => {
// 		if (course.grade) {
// 			totalPoints += calculateGradePoint(course.grade as NonNullableGrade) * course.credits;
// 			totalCredits += course.credits;
// 		}
// 	});
// 	return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
// });

export const overallGPA = derived([studentCourses, degree], ([$courses, $degree]) => {
	const { totalPoints, totalCredits } = $courses.filter(isValidCourse).reduce(
		(acc, course) => {
			if (course.grade) {
				acc.totalPoints += calculateGradePoint(course.grade as NonNullableGrade) * course.credits;
				acc.totalCredits += course.credits;
			}
			return acc;
		},
		{ totalPoints: 0, totalCredits: 0 }
	);

	return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
});

export const degreeGPA = derived([studentCourses, degree], ([$courses, $degree]) => {
	// console.log($courses);
	const { totalPoints, totalCredits } = $courses
		.filter((course) => {
			if (!course.grade || !course.requirementId) return false;

			// Check if course is completed and part of a non-level-1 requirement
			const requirement = $degree.requirements.find((req) => req.id === course.requirementId);
			return isCourseCompleted(course) && requirement && requirement.level !== 1;
		})
		.reduce(
			(acc, course) => {
				if (course.grade) {
					acc.totalPoints += calculateGradePoint(course.grade as NonNullableGrade) * course.credits;
					acc.totalCredits += course.credits;
				}
				return acc;
			},
			{ totalPoints: 0, totalCredits: 0 }
		);

	return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
});

export const addCourseGrade = (
	courseId: string,
	grade: NonNullableGrade,
	requirementId: string
): void => {
	const courseDetails = get(selectedCourse).value;
	studentCourses.update(($courses) => {
		const courseIndex = $courses.findIndex((c) => c.courseId === parseInt(courseId));

		if (courseIndex !== -1) {
			const updatedCourses = [...$courses];
			const existingCourse = updatedCourses[courseIndex]!;

			updatedCourses[courseIndex] = {
				...existingCourse,
				grade,
				requirementId
			};

			return updatedCourses;
		}

		if (!courseDetails) return $courses;

		return [
			...$courses,
			{
				id: crypto.randomUUID(),
				courseId: courseDetails.id,
				credits: courseDetails.credits,
				grade,
				requirementId
			}
		];
	});
};
