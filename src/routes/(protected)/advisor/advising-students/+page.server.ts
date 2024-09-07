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
			.where('advisor_id', '=', userId)
			.select(['advisor_id'])
			.executeTakeFirst();

		if (!advisor) {
			throw error(404, 'Advisor not found');
		}

		const students = await db
			.selectFrom('Advisor')
			.where('advisor_id', '=', advisor.advisor_id)
			.innerJoin('Student', 'Student.id', 'Advisor.student_id')
			.innerJoin('User', 'User.id', 'Student.user_id')
			.leftJoin('Program', 'Program.id', 'Student.program_id')
			.select([
				'Student.id',
				'Student.user_id',
				'User.email',
				'User.name',
				'Student.created_at',
				'Student.updated_at',
				'Student.invite_token',
				'Student.invite_expires',
				'Program.name as program_name'
			])
			.execute();

		return {
			students: students.map((student) => ({
				id: student.id,
				user_id: student.user_id,
				name: student.name,
				email: student.email,
				program_name: student.program_name,
				created_at: student.created_at,
				updated_at: student.updated_at,
			
				token: { value: student.invite_token, expires: student.invite_expires }
			}))
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
