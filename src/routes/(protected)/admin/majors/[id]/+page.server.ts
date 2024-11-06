import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { majorSchema } from './schema';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { updateMajor } from '$lib/actions/major.actions';

export const load: PageServerLoad = async ({ params }) => {
	const form = await superValidate(zod(majorSchema));
	const major = await db
		.selectFrom('Majors')
		.where('id', '=', params.id)
		.selectAll()
		.executeTakeFirst();

	if (!major) {
		redirect(303, '/majors');
	}

	const majorRequirements = await db
		.selectFrom('MajorRequirements')
		.where('majorId', '=', params.id)
		.selectAll()
		.execute();

	const courses = await db.selectFrom('Courses').selectAll().execute();
	const faculties = await db.selectFrom('Faculties').selectAll().execute();

	form.data = {
		...major,
		requirements: majorRequirements.map((requirement) => {
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
		const form = await superValidate(event, zod(majorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			console.log(form.data);

			const data = await updateMajor(form.data);

			if (!data) {
				fail(404, { message: 'Major not found' });
			}
		} catch (err) {
			console.error(err);
			error(500, { message: 'An error occurred. Please try again later.' });
		}

		return message(form, 'Major updated successfully');
	}
};
