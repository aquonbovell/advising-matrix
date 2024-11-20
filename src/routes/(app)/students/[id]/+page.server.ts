import { deleteUser, fetchUser } from '$lib/actions/user.actions';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fetchStudentDetails } from '$lib/actions/student.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const student = await fetchStudentDetails(id);
	return { student };
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
