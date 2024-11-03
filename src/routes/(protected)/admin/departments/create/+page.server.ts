import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { departmentSchema } from './schema';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { generateId } from '$lib/utils';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(departmentSchema));
	const faculties = await db.selectFrom('Faculties').select(['id', 'name']).execute();
	return { form, faculties };
};

export const actions: Actions = {
	default: async (event) => {
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

		const data = await db
			.insertInto('Departments')
			.values({ id: generateId(), name: form.data.name, facultyId: form.data.facultyId })
			.returning('id')
			.execute();

		if (!data) {
			error(500, { message: 'An error occurred. Please try again later.' });
		}

		return message(form, 'Department created successfully');
	}
};
