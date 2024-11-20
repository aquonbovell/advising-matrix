import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createMajor, fetchMajor, updateMajor } from '$lib/actions/major.actions';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';
import { majorUpdateSchema } from './majorUpdate.schema';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const major = await fetchMajor(id);
	const form = await superValidate({ ...major }, zod(majorUpdateSchema));
	const courses = await fetchCourseCodes();
	const faculties = await fetchFaculties();
	return { form, courses, faculties };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(majorUpdateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);
		try {
			const id = await updateMajor(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update major' });
		}
		return { form };
	}
};
