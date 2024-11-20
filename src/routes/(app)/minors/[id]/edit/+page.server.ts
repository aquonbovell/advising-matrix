import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createMinor, fetchMinor, updateMinor } from '$lib/actions/minor.actions';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';
import { minorUpdateSchema } from './minorUpdate.schema';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const minor = await fetchMinor(id);
	const form = await superValidate({ ...minor }, zod(minorUpdateSchema));
	const courses = await fetchCourseCodes();
	const faculties = await fetchFaculties();
	return { form, courses, faculties };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(minorUpdateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);
		try {
			const id = await updateMinor(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update minor' });
		}
		return { form };
	}
};
