import type { RouterOutputs } from '$lib/server/routes/_app';
import { derived, writable } from 'svelte/store';

export const studentCourses = writable<RouterOutputs['students']['getStudentCourses']['courses']>(
	[]
);
export const degree = writable<RouterOutputs['students']['getStudentDegree']['degree']>({
	id: '',
	name: '',
	requirements: []
});
export const program = writable<RouterOutputs['students']['getStudentProgram']['program']>({
	id: '',
	major_id: '',
	minor_id: null
});

export const completedCredits = derived(studentCourses, ($studentCourses) =>
	$studentCourses.reduce((acc, course) => {
		if (course.grade && !course.grade.startsWith('F')) {
			return acc + 3; // need to change 3 to the number of credits for the course
		}
		return acc;
	}, 0)
);

export const completedCourses = derived(
	studentCourses,
	($studentCourses) =>
		$studentCourses.filter((course) => course.grade && !course.grade.startsWith('F')).length
);

export const totalCredits = derived(degree, ($degree) =>
	$degree.requirements.reduce((acc, req) => acc + req.credits, 0)
);
