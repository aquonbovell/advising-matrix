import { deleteMajor } from '$lib/actions/major.actions';
import { db } from '$lib/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const majors = await db.selectFrom('Majors').selectAll().execute();
	return { majors };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const majorId = formData.get('id')?.toString();

		if (!majorId) {
			return { status: 400, body: { message: 'Major ID is required' } };
		}

		const data = await deleteMajor(majorId);

		if (!data) {
			return { status: 500, body: { message: 'An error occurred. Please try again later.' } };
		}

		return { status: 200, body: { message: 'Major deleted successfully' } };
	}
};
