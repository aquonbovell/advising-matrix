import { fetchDegreeExplore, fetchStudentCourses } from '$lib/server/actions/matrix.actions';
import type { PageServerLoad } from './$types';
import { fetchMajors } from '$lib/server/actions/major.actions';
import { fetchMinors } from '$lib/server/actions/minor.actions';

export const load: PageServerLoad = async ({ url, locals }) => {
	const majorId = url.searchParams.get('majorId') as string;
	const minorId = url.searchParams.get('minorId') as string;
	const id = locals.user?.id;
	let degree;
	let studentCourses;
	if (majorId) {
		degree = await fetchDegreeExplore(majorId, minorId);
		studentCourses = await fetchStudentCourses(id ?? '');
	}
	return {
		degree,
		studentCourses,
		majors: await fetchMajors(),
		minors: await fetchMinors()
	};
};
