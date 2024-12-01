import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import {
	createMajor,
	deleteMajor,
	exist,
	fetchMajor,
	updateMajor
} from '$lib/actions/major.actions';
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
	edit: async (event) => {
		const form = await superValidate(event, zod(majorUpdateSchema));

		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit majors', type: 'failure' },
				{ status: 403 }
			);
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const majorName = await exist(form.data.name, 'name', form.data.id);
		if (majorName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Major already exists. Please choose another major name'
			];
			return fail(400, { form });
		}
		try {
			console.log(form.data);

			await updateMajor(form.data);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update major', type: 'failure' }, { status: 400 });
		}
		return message(form, { message: 'Major updated', type: 'success' });
	},
	delete: async ({ params, locals, request }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete majors' });
		}
		const { id } = params;
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteMajor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete major' });
		}
		return { success: true };
	}
};
