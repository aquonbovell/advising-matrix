import { gradePoints, type CourseWithRequirement, type Grade } from '$lib/types';
import { arePrerequisitesMet } from '$lib/utils';
import { writable, derived } from 'svelte/store';

export const courseGrades = writable<Record<string, Grade | ''>>({});
export const completedCourses = writable<Record<string, boolean>>({});
export const programCourses = writable<CourseWithRequirement[]>([]);

export const poolCourses = writable<CourseWithRequirement[]>([]);

export const totalCredits = derived(
	programCourses,
	($programCourses) => $programCourses.reduce((sum, course) => sum + course.credits, 0) || 0
);

export const appliedCredits = derived(
	[completedCourses, courseGrades, programCourses],
	([$completed, $grades, $programCourses]) =>
		$programCourses.reduce(
			(sum, course) => sum + ($completed[course.id] && $grades[course.id] ? course.credits : 0),
			0
		) || 0
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

export const stillNeeded = derived(
	[completedCourses, programCourses],
	([completedCourses, programCourses]) =>
		programCourses.filter((course) => !completedCourses[course.id]).length || 0
);

export const complete = derived(
	[completedCourses, programCourses],
	([completedCourses, programCourses]) =>
		programCourses.filter((course) => completedCourses[course.id]).length || 0
);

export const progressPercentage = derived(
	[appliedCredits, totalCredits],
	([appliedCredits, totalCredits]) => (appliedCredits / totalCredits) * 100
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
					if (grade && grade in gradePoints) {
						totalPoints += gradePoints[grade] * course.credits;
						totalCredits += course.credits;
					}
				}
			});
		}

		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
	}
);
