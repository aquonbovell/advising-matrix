import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';
import { minorCreationSchema } from './minorCreation.schema';
import { createMinor } from '$lib/actions/minor.actions';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(minorCreationSchema));
	const courses = await fetchCourseCodes();
	const faculties = await fetchFaculties();
	return { form, courses, faculties };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(minorCreationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);
		try {
			const id = await createMinor(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update minor' });
		}
		return { form };
	}
};
