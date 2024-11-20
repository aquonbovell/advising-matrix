import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createMajor } from '$lib/actions/major.actions';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';
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

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);
		try {
			const id = await createMajor(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update course' });
		}
		return { form };
	}
};
