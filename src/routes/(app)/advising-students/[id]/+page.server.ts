import { deleteUser, fetchUser } from '$lib/actions/user.actions';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fetchStudentDetails } from '$lib/actions/student.actions';
import { fetchDegree, fetchStudentCourses } from '$lib/actions/matrix.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	return { degree: await fetchDegree(id), studentCourses: await fetchStudentCourses(id) };
};

export const actions: Actions = {
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteUser(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete user' });
		}
		return redirect(302, '/users');
	}
};
