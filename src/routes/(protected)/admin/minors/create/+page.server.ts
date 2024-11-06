import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { minorSchema } from './schema';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { createMinor } from '$lib/actions/minor.actions';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(minorSchema));
	const courses = await db.selectFrom('Courses').selectAll().execute();
	const faculties = await db.selectFrom('Faculties').selectAll().execute();
	return { form, courses, faculties };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(minorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const minor = await db
			.selectFrom('Minors')
			.where('name', '=', form.data.name)
			.executeTakeFirst();

		if (minor) {
			form.errors.name = [...(form.errors.name ?? ''), 'Minor already'];
			return fail(400, { form });
		}

		const data = await createMinor(form.data);

		if (!data.success) {
			return message(form, 'An error occurred. Please try again later.');
		}

		return message(form, 'Minor created successfully');
	}
};
