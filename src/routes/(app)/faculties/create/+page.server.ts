import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { facultyCreationSchema } from './facultyCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createUser } from '$lib/actions/user.actions';
import { createFaculty } from '$lib/actions/faculty.actions';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(facultyCreationSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(facultyCreationSchema));

		if (!form.valid) {
			return fail(404, { form });
		}

		console.log(form.data);
		const facultyName = await db
			.selectFrom('Faculty')
			.where('name', '=', form.data.name)
			.select(['name'])
			.executeTakeFirst();
		if (facultyName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Faculty already exists. Please choose another faculty name'
			];
			return fail(400, { form });
		}

		try {
			const facultyId = await createFaculty(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	}
};
