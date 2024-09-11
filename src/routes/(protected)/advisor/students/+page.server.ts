import { error, fail, redirect } from '@sveltejs/kit';
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
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
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
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while adding the student' });
		}
		throw redirect(303, '/advisor/students');
	}
};
