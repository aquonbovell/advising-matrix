import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createMinor, exist } from '$lib/server/actions/minor.actions';
import { fetchCourseCodes } from '$lib/server/actions/course.actions';
import { fetchFaculties } from '$lib/server/actions/faculty.actions';
import { minorCreationSchema } from './minorCreation.schema';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(minorCreationSchema));
	const courses = await fetchCourseCodes();
	const faculties = await fetchFaculties();
	return { form, courses, faculties };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(minorCreationSchema));
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

		console.log(form.data);
		const minorName = await exist(form.data.name, 'name');
		if (minorName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Minor already exists. Please choose another minor name'
			];
			return fail(400, { form });
		}
		try {
			await createMinor(form.data);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to create minor', type: 'failure' }, { status: 400 });
		}
		return message(form, { message: 'Minor created', type: 'success' });
	}
};
