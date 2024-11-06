import { db } from '$lib/db';
import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { studentSchema } from './schema';
import { sql } from 'kysely';

export const load = (async ({ params }) => {
	const form = await superValidate(zod(studentSchema));

	const student = await db
		.selectFrom('Student')
		.innerJoin('User', 'User.id', 'Student.user_id')
		.where('Student.id', '=', params.id)
		.select([
			'Student.id',
			'major_id',
			'minor_id',
			'user_id',
			'invite_token',
			'invite_expires',
			'name'
		])
		.executeTakeFirst();

	if (!student) {
		error(404, { message: 'Student not found' });
	}

	const studentAdvisors = await db
		.selectFrom('Advisor')
		.where('student_id', '=', params.id)
		.select(['advisor_id'])
		.execute();

	form.data = {
		studentId: student.id,
		name: student.name,
		userId: student.user_id,
		majorId: student.major_id,
		minorId: student.minor_id,
		advisors: studentAdvisors.map((advisor) => advisor.advisor_id)
	};
	const majors = await db.selectFrom('Majors').select(['id', 'name']).execute();
	const minors = await db
		.selectFrom('Majors')
		.select(['Majors.id as id', sql<string>`CONCAT("Majors".name, ' (Major) ')`.as('name')])
		.union(
			db
				.selectFrom('Minors')
				.select(['Minors.id as id', sql<string>`CONCAT("Minors".name, ' (Minor) ')`.as('name')])
		)
		.execute();

	const advisors = await db
		.selectFrom('User')
		.where('role', '=', 'ADVISOR')
		.select(['id', 'name'])
		.execute();
	return { form, majors, minors, advisors };
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN')
			return fail(401, {
				message: 'You are not authorized to perform this action',
				success: false
			});

		try {
			await db.transaction().execute(async (db) => {
				await db.deleteFrom('Advisor').where('student_id', '=', params.id).execute();
				await db.deleteFrom('Student').where('id', '=', params.id).execute();
			});
		} catch (err) {
			console.error(err);
			error(500, { message: 'An error occurred while deleting the student' });
		}
		return redirect(303, '/admin/students');
	},
	edit: async (event) => {
		const form = await superValidate(event, zod(studentSchema));

		if (event.locals.user?.role !== 'ADMIN') {
			return message(form, 'You are not authorized to perform this action', { status: 401 });
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);

		try {
			await db.transaction().execute(async (db) => {
				const student = await db
					.updateTable('Student')
					.set({
						major_id: form.data.majorId,
						minor_id: form.data.minorId,
						user_id: form.data.userId,
						updated_at: new Date()
					})
					.where('id', '=', form.data.studentId)
					.executeTakeFirst();

				if (student) {
					await db.deleteFrom('Advisor').where('student_id', '=', form.data.studentId).execute();
					for (const advisorId of form.data.advisors) {
						await db
							.insertInto('Advisor')
							.values({
								advisor_id: advisorId,
								student_id: form.data.studentId
							})
							.execute();
					}
				}
				if (!student) {
					return message(form, 'An error occurred while creating the user', { status: 500 });
				}
			});

			return { success: true };
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to create student' });
		}
	}
};
