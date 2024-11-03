import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { facultySchema } from './schema';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { generateId } from '$lib/utils';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(facultySchema));
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
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

		const data = await db
			.insertInto('Faculties')
			.values({ id: generateId(), name: form.data.name })
			.returning('id')
			.execute();

		if (!data) {
			error(500, { message: 'An error occurred. Please try again later.' });
		}

		return message(form, 'Faculty created successfully');
	}
};
