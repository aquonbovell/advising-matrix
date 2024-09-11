import {
	gradePoints,
	type CourseWithPrerequisites,
	type CourseWithRequirement,
	type Grade
} from '$lib/types';
import { arePrerequisitesMet } from '$lib/utils';
import { writable, derived, readonly } from 'svelte/store';

export const courseGrades = writable<Record<string, { id: string; grade: Grade | '' }[]>>({});
// export const completedCourses = writable<Record<string, boolean>>({});
export const requirementCourses = writable<string[]>([]);
export const programCourses = writable<CourseWithRequirement[]>([]);

export const poolCourses = writable<CourseWithPrerequisites[]>([]);

export const totalCredits = writable(0);
export const totalCourses = writable(0);

export const completedCourses = derived([courseGrades], ([$courseGrades]) =>
	// Object.keys($courseGrades).reduce((acc, courseId) => {
	// 	const grades = $courseGrades[courseId];
	// 	if (grades.some((grade) => grade.grade)) {
	// 		acc[courseId] = true;
	// 	}
	// 	return acc;
	// }, {} as Record<string, boolean>)
	Object.keys($courseGrades).reduce(
		(acc, courseId) => {
			const grades = $courseGrades[courseId];
			if (grades?.flatMap((grade) => grade.grade).some((grade) => !grade?.startsWith('F'))) {
				acc[courseId] = true;
			} else {
				acc[courseId] = false;
			}
			return acc;
		},
		{} as Record<string, boolean>
	)
);

export const appliedCredits = derived(
	[completedCourses, courseGrades, programCourses, requirementCourses],
	([$completed, $grades, $programCourses, $requirementCourses]) => {
		const codes = [...new Set($requirementCourses.map((course) => course.split(',')[0]))];
		const count = codes.reduce((totalCredits, code) => {
			const completed = $completed[code!];
			const grades = $grades[code!]?.flatMap((g) => g.grade);

			// Only count credits if the course is completed and grades don't start with 'F'
			const hasPassingGrade = grades && grades.some((grade) => grade && !grade.startsWith('F'));

			return totalCredits + (completed && hasPassingGrade ? 3 : 0);
		}, 0);
		const pcount =
			$programCourses
				// .filter((course) =>
				//   course.code[4] === '2' ||
				//   (course.code[4] === '3' && !course.code.startsWith('COOR'))
				// )
				.reduce((totalCredits, course) => {
					const completed = $completed[course.id];
					const grades = $grades[course.id]?.flatMap((g) => g.grade);

					// Only count credits if the course is completed and grades don't start with 'F'
					const hasPassingGrade = grades && grades.some((grade) => grade && !grade.startsWith('F'));

					return totalCredits + (completed && hasPassingGrade ? course.credits : 0);
				}, 0) || 0;
		return count + pcount;
	}
);

export const inProgress = derived(
	[completedCourses, programCourses],
	([completedCourses, programCourses]) => {
		return (
			programCourses.filter((course) => !completedCourses[course.id] && arePrerequisitesMet(course))
				.length || 0
		);
	}
);

export const complete = derived(
	[completedCourses, programCourses, requirementCourses],
	([completedCourses, programCourses, requirementCourses]) => {
		const codes = [...new Set(requirementCourses.map((course) => course.split(',')[0]))];
		const count = codes.reduce((totalCredits, code) => {
			const completed = completedCourses[code!];
			return totalCredits + (completed ? 1 : 0);
		}, 0);
		return count + programCourses.filter((course) => completedCourses[course.id]).length || 0;
	}
);

export const progressPercentage = derived(
	[appliedCredits, totalCredits],
	([appliedCredits, totalCredits]) => (appliedCredits / totalCredits) * 100
);

export const stillNeeded = derived(
	[complete, totalCourses],
	([complete, totalCourses]) => totalCourses - complete
);

export const gpa = derived(
	[courseGrades, completedCourses, programCourses],
	([$grades, $completed, $programCourses]) => {
		let totalPoints = 0;
		let totalCredits = 0;

		if ($programCourses && Array.isArray($programCourses)) {
			$programCourses.forEach((course) => {
				if ($completed[course.id]) {
					const grade = $grades[course.id];

					for (const element of grade ?? []) {
						if (grade && element.grade! in gradePoints) {
							totalPoints += gradePoints[element.grade] * course.credits;
							totalCredits += course.credits;
						}
					}
				}
			});
		}

		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
	}
);
