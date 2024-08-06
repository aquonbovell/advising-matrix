import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	try {
		const students = await db
			.selectFrom('Student')
			.innerJoin('Program', 'Program.id', 'Student.program_id')
			.innerJoin('User', 'User.id', 'Student.user_id')
			.select(['Student.id', 'User.name', 'User.email', 'Program.name as program'])
			.execute();

		return {
			students
		};
	} catch (err) {
		console.error(err);
		throw error(500, 'An error occurred while fetching the advisor');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}
		const formData = await request.formData();
		const studentCode = formData.get('student_code') as string;

		console.log('default', studentCode);

		try {
			const result = await db
				.insertInto('Advisor')
				.values({
					id: locals.user.id,
					user_id: studentCode
				})
				.execute();
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while adding the student' });
		}
		throw redirect(303, '/advisor/students');
	}
};
