import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import type { Program } from '$lib/db/schema';
import { generateId } from 'lucia';
import Vine from '@vinejs/vine';
import { message, superValidate } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';

const defaults = { id: '', email: '', name: '', programId: '' };

const schema = Vine.object({
	id: Vine.string().trim(),
	email: Vine.string()
		.trim()
		.email()
		.regex(/@mycavehill\.uwi\.edu$/),
	name: Vine.string().trim().minLength(3).maxLength(50),
	programId: Vine.string().trim()
});

export const load = (async ({ locals, params }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const studentData = await db
		.selectFrom('Student')
		.innerJoin('User', 'User.id', 'Student.user_id')
		.select(['User.email', 'User.name', 'Student.program_id', 'User.role', 'User.id'])
		.where('Student.id', '=', params.id)
		.executeTakeFirst();

	if (!studentData) {
		throw error(404, 'Student Not found');
	}

	const studentPrograms: Program[] = await db.selectFrom('Program').selectAll().execute();

	const form = await superValidate(vine(schema, { defaults }));
	form.data = {
		id: studentData.id,
		programId: studentData.program_id ?? '',
		email: studentData.email,
		name: studentData.name ?? ''
	};

	return { student: { ...studentData }, majors: studentPrograms, form };
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
	},
	save: async ({ request }) => {
		const form = await superValidate(request, vine(schema, { defaults }));

		if (form.errors.email) {
			form.errors.email = [
				'Please enter a valid email address with the domain @mycavehill.uwi.edu'
			];
		}

		if (form.errors.name) {
			form.errors.name = ['Please enter a valid name'];
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, name, programId, id } = form.data;

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({
						email,
						name,
						updated_at: new Date()
					})
					.where('id', '=', id)
					.execute();

				await trx
					.updateTable('Student')
					.set({ program_id: programId })
					.where('user_id', '=', id)
					.execute();
			});
			return message(form, 'Student updated successfully');
		} catch (error) {}
		return fail(500, { error: 'Failed to update student' });
	}
};
