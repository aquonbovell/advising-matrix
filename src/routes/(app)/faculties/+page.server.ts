import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteFaculty } from '$lib/server/actions/faculty.actions';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete faculties' });
		}
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteFaculty(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete faculty' });
		}
		return { success: true };
	}
};
