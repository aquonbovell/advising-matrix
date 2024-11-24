import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createMinor, fetchMinor, updateMinor } from '$lib/actions/minor.actions';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';
import { minorUpdateSchema } from './minorUpdate.schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	const role = locals.user?.role;

	if (role !== 'ADMIN') {
		redirect(303, '/minors');
	}
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

		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit minors', type: 'failure' },
				{ status: 403 }
			);
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);
		try {
			const id = await updateMinor(form.data);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update minor', type: 'failure' }, { status: 400 });
		}
		return message(form, { message: 'Minor created', type: 'success' });
	}
};
