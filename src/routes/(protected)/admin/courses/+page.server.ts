import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { remove } from '$lib/actions/course.action';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}

	return {};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const code = data.get('code');

		if (!code) {
			return fail(400, { message: 'Invalid course code' });
		}

		try {
			const result = await remove(code.toString());

			if (!result.success) {
				throw new Error('Failed to delete course');
			}

			return result;
		} catch (err) {
			console.error('Error deleting course:', err);
			error(500, 'Failed to delete course');
		}
	}
};
