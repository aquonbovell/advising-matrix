import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { facultyUpdateSchema } from '$lib/schemas/faculty';
import {
	checkFacultyAvailability,
	deleteFacultyFromId,
	getFacultyFromId,
	updateFaculty
} from '$lib/server/actions/faculty.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const faculty = await getFacultyFromId(event.params.id);

	if (!faculty) {
		error(404, 'Faculty not found');
	}

	const form = await superValidate(zod(facultyUpdateSchema));

	form.data = {
		id: faculty.id,
		name: faculty.name
	};

	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(facultyUpdateSchema));

		if (event.locals.session === null || event.locals.user === null) {
			return message(form, { message: 'Not authenticated', type: 'error' }, { status: 401 });
		}

		// if (
		// 	!event.locals.user.emailVerified ||
		// 	!event.locals.user.registered2FA ||
		// 	event.locals.session.twoFactorVerified
		// ) {
		// 	return message(form, { message: 'Forbidden', type: 'error' }, { status: 403 });
		// }

		if (event.locals.user.role !== 'admin') {
			return message(form, { message: 'Forbidden', type: 'error' }, { status: 403 });
		}

		if (!form.valid) {
			return fail(404, { form });
		}

		const name = await checkFacultyAvailability(form.data.name);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Faculty name already exists. Please choose another name'
			];
			return fail(400, { form });
		}

		try {
			console.log('Updating faculty');

			console.log(form.data);

			await updateFaculty(form.data.id, form.data.name);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update faculty', type: 'failure' },
				{ status: 400 }
			);
		}
		return redirect(302, `/courses/faculties/show/${form.data.id}`);
	},
	delete: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return fail(401, {
				message: 'Not authenticated'
			});
		}
		if (event.locals.user.role !== 'admin') {
			return fail(403, {
				message: 'Forbidden'
			});
		}

		const formData = await event.request.formData();

		const id = formData.get('id');

		if (typeof id !== 'string') {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}
		if (id === '') {
			return fail(400, {
				message: "Enter the faculty's Id"
			});
		}

		const deleted = await deleteFacultyFromId(id);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
