import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { departmentSchema } from './schema';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ params }) => {
	const form = await superValidate(zod(departmentSchema));
	const department = await db
		.selectFrom('Departments')
		.where('id', '=', params.id)
		.selectAll()
		.executeTakeFirst();

	if (!department) error(404, 'Department not found');

	if (!department) {
		redirect(303, '/departments');
	}

	form.data = {
		...department
	};

	const faculties = await db.selectFrom('Faculties').select(['id', 'name']).execute();

	return {
		form,
		faculties
	};
};

export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(departmentSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		const departmentId = await db
			.selectFrom('Departments')
			.where('name', '=', form.data.name)
			.select('id')
			.executeTakeFirst();

		if (departmentId) {
			form.errors.name = [...(form.errors.name ?? ''), 'Department already exists'];
			return fail(400, { form });
		}

		try {
			await db.transaction().execute(async (db) => {
				const data = await db
					.updateTable('Departments')
					.set({ name: form.data.name })
					.where('id', '=', form.data.id)
					.returning('id')
					.execute();

				if (!data) {
					error(500, { message: 'An error occurred. Please try again later.' });
				}
			});
			return message(form, 'Department updated successfully');
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to update department' });
		}
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') error(401, 'Unauthorized');

		try {
			await db.transaction().execute(async (db) => {
				const data = await db.deleteFrom('Departments').where('id', '=', params.id).execute();

				if (!data) {
					error(500, { message: 'An error occurred. Please try again later.' });
				}
			});
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to delete department' });
		}
		redirect(303, '/admin/departments');
	}
};
