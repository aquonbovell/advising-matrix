import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { studentSchema } from './schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { UserRole } from '$lib/db/schema';
import { Argon2id } from 'oslo/password';
import { DEFAULT_PASSWORD } from '$env/static/private';
import { generateTokenWithExpiration } from '$lib/server/auth';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}
	const users = await db
		.selectFrom('User')
		.where('role', '=', 'STUDENT')
		.select(['id', 'name'])
		.where('id', 'not in', db.selectFrom('Student').select('user_id'))
		.execute();
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

	return { form: await superValidate(zod(studentSchema)), users, majors, minors, advisors };
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(studentSchema));

		if (event.locals.user?.role !== 'ADMIN') {
			return message(form, 'You are not authorized to perform this action', { status: 401 });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const { expiresAt, token } = generateTokenWithExpiration();

		try {
			await db.transaction().execute(async (db) => {
				const student = await db
					.insertInto('Student')
					.values({
						id: crypto.randomUUID(),
						major_id: form.data.majorId,
						minor_id: form.data.minorId,
						user_id: form.data.userId,
						invite_token: token,
						invite_expires: new Date(expiresAt),
						created_at: new Date(),
						updated_at: new Date()
					})
					.returning('id')
					.executeTakeFirst();

				if (student) {
					for (const advisorId of form.data.advisors) {
						await db
							.insertInto('Advisor')
							.values({
								advisor_id: advisorId,
								student_id: student.id
							})
							.execute();
					}
				}
				if (!student) {
					return message(form, 'An error occurred while creating the user', { status: 500 });
				}
			});
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to create student' });
		}

		return redirect(303, `/admin/students/`);
	}
};
