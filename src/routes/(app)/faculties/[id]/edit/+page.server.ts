import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
	deleteFaculty,
	exist,
	fetchFaculty,
	updateFaculty
} from '$lib/server/actions/faculty.actions';
import { facultyUpdateSchema } from './facultyUpdateSchema.schema';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	try {
		const faculty = await fetchFaculty(id);
		const form = await superValidate({ ...faculty }, zod(facultyUpdateSchema));
		return { form };
	} catch (err) {
		console.error(err);
		return error(404, {
			message: 'Not found'
		});
	}
};

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(facultyUpdateSchema));

		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit faculties', type: 'failure' },
				{ status: 403 }
			);
		}

		if (!form.valid) {
			return fail(400, { form });
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
			await updateFaculty(form.data);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update faculty', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Faculty updated', type: 'success' });
	},
	delete: async ({ params, locals, request }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete faculties' });
		}
		const { id } = params;
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteFaculty(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete faculty' });
		}
		return { success: true };
	}
};
