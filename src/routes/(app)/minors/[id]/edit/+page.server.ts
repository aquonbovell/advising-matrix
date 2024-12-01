import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail } from '@sveltejs/kit';
import { deleteMinor, exist, fetchMinor, updateMinor } from '$lib/actions/minor.actions';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';
import { minorUpdateSchema } from './minorUpdate.schema';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	try {
		const minor = await fetchMinor(id);
		const form = await superValidate({ ...minor }, zod(minorUpdateSchema));
		const courses = await fetchCourseCodes();
		const faculties = await fetchFaculties();
		return { form, courses, faculties };
	} catch (err) {
		console.error(err);
		return error(404, { message: 'Not Found' });
	}
};

export const actions: Actions = {
	edit: async (event) => {
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

		const minorName = await exist(form.data.name, 'name', form.data.id);
		if (minorName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Minor already exists. Please choose another minor name'
			];
			return fail(400, { form });
		}
		try {
			await updateMinor(form.data);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update minor', type: 'failure' }, { status: 400 });
		}
		return message(form, { message: 'Minor updated', type: 'success' });
	},
	delete: async ({ params, locals, request }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete minors' });
		}
		const { id } = params;
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteMinor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete minor' });
		}
		return { success: true };
	}
};
