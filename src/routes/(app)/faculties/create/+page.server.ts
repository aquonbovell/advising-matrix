import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { facultyCreationSchema } from './facultyCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createFaculty, exist } from '$lib/server/actions/faculty.actions';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(facultyCreationSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(facultyCreationSchema));
		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to create faculties', type: 'failure' },
				{ status: 403 }
			);
		}
		if (!form.valid) {
			return fail(404, { form });
		}

		const facultyName = await exist(form.data.name, 'name');
		if (facultyName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Faculty already exists. Please choose another faculty name'
			];
			return fail(400, { form });
		}

		try {
			await createFaculty(form.data);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create faculty', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Faculty created', type: 'success' });
	}
};
