import { deleteMinor } from '$lib/actions/minor.actions';
import { db } from '$lib/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const minorId = formData.get('id')?.toString();

		if (!minorId) {
			return { status: 400, body: { message: 'Minor ID is required' } };
		}
		try {
			await deleteMinor(minorId);

			return { status: 200, body: { message: 'Minor deleted successfully' } };
		} catch (error) {
			console.error('Failed to delete minor:', error);
			return { status: 500, body: { message: 'An error occurred while deleting the minor' } };
		}
	}
};
