import { fetchDegree, fetchStudentCourses } from '$lib/actions/matrix.actions';
import { fetchStudent, fetchStudentByUserId } from '$lib/actions/student.actions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const id = locals.user?.id;
	if (!id) {
		return { status: 401, error: new Error('Unauthorized') };
	}
	const student = await fetchStudentByUserId(id);
	return {
		degree: await fetchDegree(student.id),
		studentCourses: await fetchStudentCourses(student.id)
	};
};
