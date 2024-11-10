import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user?.role !== 'ADVISOR') {
		error(401, 'Unauthorized');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(401, {
				message: 'You are not authorized to perform this action',
				success: false
			});
		}
		const formData = await request.formData();
		const studentCode = formData.get('student_code') as string;

		try {
			const result = await db
				.insertInto('Advisor')
				.values({
					advisor_id: locals.user.id,
					student_id: studentCode
				})
				.execute();
			// TODO: Add a toast message
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while adding the student' });
		}
		throw redirect(303, '/advisor/students');
	}
};
