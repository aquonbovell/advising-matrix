import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	try {
		const advisor = await db
			.selectFrom('Advisor')
			.where('user_id', '=', userId)
			.select(['id'])
			.executeTakeFirst();

		if (!advisor) {
			throw error(404, 'Advisor not found');
		}

		const students = await db
			.selectFrom('Student')
			.where('advisor_id', '=', advisor.id)
			.innerJoin('User', 'User.id', 'Student.user_id')
			.leftJoin('Program', 'Program.id', 'Student.program_id')
			.select([
				'Student.id',
				'Student.user_id',
				'User.email',
				'Student.created_at',
				'Student.updated_at',
				'Student.invite_token',
				'Student.invite_expires',
				'Program.name as program_name'
			])
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
				.where('user_id', '=', studentId)
				.select('Student.user_id')
				.executeTakeFirst();

			console.log(student);

			if (!student) {
				return fail(404, { error: 'Student not found' });
			}

			// Use a transaction to delete both Student and User records
			await db.transaction().execute(async (trx) => {
				await trx.deleteFrom('Student').where('id', '=', studentId).executeTakeFirst();

				await trx.deleteFrom('User').where('id', '=', student.user_id).executeTakeFirst();
			});

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while removing the student' });
		}
	}
};
