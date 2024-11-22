import {} from '$lib/actions/user.actions';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteStudent, fetchAdvisingStudents } from '$lib/actions/student.actions';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return fail(401, { message: 'Unauthorized' });
	}
	return { students: (await fetchAdvisingStudents(userId)) ?? [] };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteStudent(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete user' });
		}
		return redirect(302, '/users');
	}
};
