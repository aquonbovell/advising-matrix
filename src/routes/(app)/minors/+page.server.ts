import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteMinor } from '$lib/actions/minor.actions';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete minors' });
		}
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteMinor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete minor' });
		}
		return { success: true };
	}
};
