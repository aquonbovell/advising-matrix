import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		error(403, 'Unauthorized');
	}
	if (locals.user?.role === 'STUDENT') {
		error(403, 'Unauthorized');
	}

	try {
		const students = await db
			.selectFrom('Student')
			.innerJoin('Majors', 'Majors.id', 'Student.major_id')
			.innerJoin('Minors', 'Minors.id', 'Student.minor_id')
			.innerJoin('User', 'User.id', 'Student.user_id')
			.innerJoin('Advisor', 'Advisor.student_id', 'Student.id')
			.select([
				'Student.id',
				'Student.user_id',
				'User.name',
				'User.email',
				'Student.created_at',
				'Student.updated_at',
				'Student.invite_token',
				'Student.invite_expires',
				'Majors.name as major',
				'Minors.name as minor'
			])
			.execute();

		let studentData = [];

		const AdvisorsDB = await db
			.selectFrom('Advisor')
			.innerJoin('User', 'User.id', 'Advisor.advisor_id')
			.select(['User.name', 'Advisor.student_id'])
			.execute();

		for (const student of students) {
			const advisor = AdvisorsDB.filter((a) => a.student_id === student.id);

			studentData.push({
				id: student.id,
				user_id: student.user_id,
				name: student.name,
				email: student.email,
				program_name:
					student.minor === 'No Minor' ? student.major : student.major + ' with ' + student.minor,
				created_at: student.created_at,
				updated_at: student.updated_at,
				token: { value: student.invite_token, expires: student.invite_expires },
				advisor: advisor.flatMap((a) => a.name).join(', ') || 'No advisor'
			});
		}

		return {
			students: studentData
		};
	} catch (err) {
		console.error(err);
		error(500, 'An error occurred while fetching data');
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
