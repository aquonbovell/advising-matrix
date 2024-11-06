import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { majorSchema } from './schema';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { createMajor } from '$lib/actions/major.actions';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(majorSchema));
	const courses = await db.selectFrom('Courses').selectAll().execute();
	const faculties = await db.selectFrom('Faculties').selectAll().execute();
	return { form, courses, faculties };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(majorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const major = await db
			.selectFrom('Majors')
			.where('name', '=', form.data.name)
			.executeTakeFirst();

		if (major) {
			form.errors.name = [...(form.errors.name ?? ''), 'Major already'];
			return fail(400, { form });
		}

		const data = await createMajor(form.data);

		if (!data.success) {
			return message(form, 'An error occurred. Please try again later.');
		}

		return message(form, 'Major created successfully');
	}
};
