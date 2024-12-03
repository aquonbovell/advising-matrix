import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createMajor, exist } from '$lib/server/actions/major.actions';
import { fetchCourseCodes } from '$lib/server/actions/course.actions';
import { fetchFaculties } from '$lib/server/actions/faculty.actions';
import { majorCreationSchema } from './majorCreation.schema';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(majorCreationSchema));
	const courses = await fetchCourseCodes();
	const faculties = await fetchFaculties();
	return { form, courses, faculties };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(majorCreationSchema));
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
		const majorName = await exist(form.data.name, 'name');
		if (majorName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Major already exists. Please choose another major name'
			];
			return fail(400, { form });
		}
		try {
			await createMajor(form.data);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to create major', type: 'failure' }, { status: 400 });
		}
		return message(form, { message: 'Major created', type: 'success' });
	}
};
