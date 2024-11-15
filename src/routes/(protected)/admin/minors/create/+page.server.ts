import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { minorSchema } from './schema';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { createMinor } from '$lib/actions/minor.actions';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(minorSchema));
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(minorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const minor = await db
			.selectFrom('Minors')
			.where('name', 'ilike', `${form.data.name}`)
			.executeTakeFirst();

		if (minor) {
			form.errors.name = [...(form.errors.name ?? ''), 'Minor already'];
			return fail(400, { form });
		}

		const data = await createMinor(form.data.name, form.data.requirements);

		if (!data) {
			return fail(500, { message: 'An error occurred. Please try again later.' });
		}
		redirect(303, `/admin/minors/${data.id}`);
	}
};
