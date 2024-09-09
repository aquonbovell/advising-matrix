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
			.select([
				'Student.id',
				'Student.user_id',
				'User.name',
				'User.email',
				'Student.created_at',
				'Student.updated_at',
				'Student.invite_token',
				'Student.invite_expires',
				'Program.name as program'
			])
			.execute();

		let studentData = [];

		for (const student of students) {
			const advisor = await db
				.selectFrom('Advisor')
				.innerJoin('User', 'User.id', 'Advisor.advisor_id')
				.where('Advisor.student_id', '=', student.id)
				.select(['User.name'])
				.execute();

			studentData.push({
				id: student.id,
				user_id: student.user_id,
				name: student.name,
				email: student.email,
				program_name: student.program,
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
					advisor_id: locals.user.id,
					student_id: studentCode
				})
				.execute();
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while adding the student' });
		}
		throw redirect(303, '/advisor/students');
	}
};
