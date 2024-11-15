import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { minorSchema } from './schema';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { updateMinor } from '$lib/actions/minor.actions';

export const load: PageServerLoad = async ({ params }) => {
	const form = await superValidate(zod(minorSchema));
	const minor = await db
		.selectFrom('Minors')
		.where('id', '=', params.id)
		.selectAll()
		.executeTakeFirst();

	if (!minor) {
		redirect(303, '/minors');
	}

	const minorRequirements = await db
		.selectFrom('MinorRequirements')
		.where('minorId', '=', params.id)
		.selectAll()
		.execute();

	const courses = await db.selectFrom('Courses').selectAll().execute();
	const faculties = await db.selectFrom('Faculties').selectAll().execute();

	form.data = {
		...minor,
		requirements: minorRequirements.map((requirement) => {
			return {
				...requirement,
				details: JSON.parse(requirement.details) as string[],
				level: JSON.parse(requirement.level) as number[]
			};
		})
	};

	return { form, courses, faculties };
};

export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(minorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			console.log(form.data);

			await updateMinor(form.data.id, form.data.name, form.data.requirements);
		} catch (err) {
			console.error(err);
			error(500, { message: 'An error occurred. Please try again later.' });
		}
		redirect(303, `/admin/minors/${form.data.id}`);

		return message(form, 'Minor updated successfully');
	}
};
