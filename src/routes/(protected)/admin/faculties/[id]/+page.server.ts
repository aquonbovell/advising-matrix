import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { facultySchema } from './schema';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ params }) => {
	const form = await superValidate(zod(facultySchema));
	const faculty = await db
		.selectFrom('Faculties')
		.where('id', '=', params.id)
		.selectAll()
		.executeTakeFirst();

	if (!faculty) error(404, 'Faculty not found');

	if (!faculty) {
		redirect(303, '/faculties');
	}

	form.data = {
		...faculty
	};

	return {
		form
	};
};

export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(facultySchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		const facultyId = await db
			.selectFrom('Faculties')
			.where('name', '=', form.data.name)
			.select('id')
			.executeTakeFirst();

		if (facultyId) {
			form.errors.name = [...(form.errors.name ?? ''), 'Faculty already exists'];
			return fail(400, { form });
		}

		try {
			await db.transaction().execute(async (db) => {
				const data = await db
					.updateTable('Faculties')
					.set({ name: form.data.name })
					.where('id', '=', form.data.id)
					.returning('id')
					.execute();

				if (!data) {
					error(500, { message: 'An error occurred. Please try again later.' });
				}
			});
			return message(form, 'Faculty updated successfully');
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to update faculty' });
		}
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') error(401, 'Unauthorized');

		try {
			await db.transaction().execute(async (db) => {
				const data = await db.deleteFrom('Faculties').where('id', '=', params.id).execute();

				if (!data) {
					error(500, { message: 'An error occurred. Please try again later.' });
				}
			});
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to delete faculty' });
		}
		redirect(303, '/admin/faculties');
	}
};
