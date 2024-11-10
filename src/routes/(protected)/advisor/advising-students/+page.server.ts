import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { restrict } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user?.role !== 'ADVISOR') {
		error(401, 'Unauthorized');
	}

	return {};
};

export const actions: Actions = {
	removeInvite: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const studentId = formData.get('studentID') as string;

		if (!studentId) {
			return fail(400, { error: 'Invalid student ID' });
		}

		try {
			const student = await db
				.selectFrom('Student')
				.where('id', '=', studentId)
				.select(['id', 'user_id'])
				.executeTakeFirst();

			if (!student) {
				return fail(404, { error: 'Student not found' });
			}

			// Use a transaction to delete both Student and User records
			await db.transaction().execute(async (trx) => {
				await trx.deleteFrom('Student').where('id', '=', student.id).executeTakeFirst();
				await trx.deleteFrom('User').where('id', '=', student.user_id).executeTakeFirst();
			});

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while removing the student' });
		}
	}
};
