import {
	type CourseRequirementDetails,
	type NonNullableGrade,
	type Program,
	type StudentCourse
} from '$lib/types';
import { calculateGradePoint, isCourseCompleted, isValidCourse } from '$lib/utils';
import { derived, writable } from 'svelte/store';

export const codes = writable<{ id: string; credits: number; code: string; name: string }[]>([]);
export const studentCourses = writable<StudentCourse[]>([]);
export const degree = writable<Program>({
	id: '',
	name: '',
	studentName: '',
	requirements: []
});

export const completedCredits = derived([studentCourses, codes], ([$studentCourses, $codes]) =>
	$studentCourses.reduce((total, course) => {
		if (isCourseCompleted(course)) {
			const courseCredits = $codes.find((code) => code.id === course.courseId)?.credits || 3;
			return total + courseCredits;
		}
		return total;
	}, 0)
);

export const completedCourses = derived(studentCourses, ($studentCourses) =>
	$studentCourses.filter(isCourseCompleted).map((course) => course.courseId)
);

export const totalCredits = derived(degree, ($degree) =>
	$degree.requirements.reduce((total, requirement) => total + requirement.credits, 0)
);

export const overallGPA = derived([studentCourses, codes], ([$courses, $codes]) => {
	const { totalPoints, totalCredits } = $courses.filter(isValidCourse).reduce(
		(acc, course) => {
			const credits = $codes.find((code) => code.id === course.courseId)?.credits || 3;
			if (course.grade.length > 0) {
				acc.totalPoints += calculateGradePoint(course.grade as NonNullableGrade[], credits);
				acc.totalCredits += credits * course.grade.length;
			}
			return acc;
		},
		{ totalPoints: 0, totalCredits: 0 }
	);
	console.log(totalPoints, totalCredits);

	return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0.0;
});

export const degreeGPA = derived([studentCourses, degree, codes], ([$courses, $degree, $codes]) => {
	const { totalPoints, totalCredits } = $courses
		.filter((course) => {
			if (!course.grade || !course.requirementId) return false;

			// Check if course is completed and part of a non-level-1 requirement
			const requirement = $degree.requirements.find((req) => req.id === course.requirementId);
			return isCourseCompleted(course) && requirement && !requirement.level.includes(1);
		})
		.reduce(
			(acc, course) => {
				const credits = $codes.find((code) => code.id === course.courseId)?.credits || 3;
				if (course.grade.length > 0) {
					acc.totalPoints += calculateGradePoint(course.grade as NonNullableGrade[], credits);
					acc.totalCredits += credits * course.grade.length;
				}
				return acc;
			},
			{ totalPoints: 0, totalCredits: 0 }
		);

	return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0.0;
});

// export const addCourseGrade = (
// 	courseId: string,
// 	grade: NonNullableGrade,
// 	requirementId: string,
// 	userId: string | null = null,
// 	name: string | null = null
// ): void => {
// 	const courseDetails = get(selectedCourse).value;

// 	studentCourses.update((courses) => {
// 		const courseIndex = courses.findIndex((c) => c.courseId === courseId);

// 		if (courseIndex !== -1) {
// 			const updatedCourses = [...courses];
// 			const existingCourse = updatedCourses[courseIndex]!;

// 			updatedCourses[courseIndex] = {
// 				...existingCourse,
// 				grade: [...existingCourse.grade, grade].join(','),
// 				userId,

// 				requirementId
// 			};

// 			return updatedCourses;
// 		}

// 		if (!courseDetails) return courses;

// 		return [
// 			...courses,
// 			{
// 				id: crypto.randomUUID(),
// 				courseId: courseDetails.id,
// 				credits: courseDetails.credits,
// 				userId,
// 				name,
// 				grade: [grade],
// 				requirementId
// 			}
// 		];
// 	});
// };
