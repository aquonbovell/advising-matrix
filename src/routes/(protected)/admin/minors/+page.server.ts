import { deleteMinor } from '$lib/actions/minor.actions';
import { db } from '$lib/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const minors = await db.selectFrom('Minors').selectAll().execute();
	return { minors };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const minorId = formData.get('id')?.toString();

		if (!minorId) {
			return { status: 400, body: { message: 'Minor ID is required' } };
		}

		const data = await deleteMinor(minorId);

		if (!data) {
			return { status: 500, body: { message: 'An error occurred. Please try again later.' } };
		}

		return { status: 200, body: { message: 'Minor deleted successfully' } };
	}
};
