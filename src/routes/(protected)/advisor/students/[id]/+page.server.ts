import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import type { Program } from '$lib/db/schema';

export const load = (async ({ locals, params }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const studentData = await db
		.selectFrom('Student')
		.innerJoin('User', 'User.id', 'Student.user_id')
		.select(['User.email', 'User.name', 'Student.program_id', 'User.role'])
		.where('Student.id', '=', params.id)
		.executeTakeFirst();

	if (!studentData) {
		throw error(404, 'Student Not found');
	}

	const studentPrograms: Program[] = await db.selectFrom('Program').selectAll().execute();

	return { student: { ...studentData }, majors: studentPrograms };
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('floating_email');
		if (!email) {
			throw error(400, 'Bad Request');
		}
		const result = await db.deleteFrom('User').where('email', '=', email.toString()).execute();

		console.log(result);

		redirect(304, '/advisor/students');
	}
};
