import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteFaculty, fetchFaculty } from '$lib/actions/faculty.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const faculty = await fetchFaculty(id);
	return { faculty };
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete faculties' });
		}
		const { id } = params;
		try {
			await deleteFaculty(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete faculty' });
		}
		return { success: true };
	}
};
