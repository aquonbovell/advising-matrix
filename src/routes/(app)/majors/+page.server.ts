import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteMajor, fetchMajors } from '$lib/actions/major.actions';

export const load: PageServerLoad = async () => {
	return { majors: await fetchMajors() };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete majors' });
		}
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteMajor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete major' });
		}
		return { success: true };
	}
};
