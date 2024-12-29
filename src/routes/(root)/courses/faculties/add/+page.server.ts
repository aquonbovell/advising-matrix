import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { facultyCreationSchema } from '$lib/schemas/faculty';
import { checkFacultyAvailability, createFaculty } from '$lib/server/actions/faculty.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}
	return { form: await superValidate(zod(facultyCreationSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(facultyCreationSchema));

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
			console.log('Creating faculty');

			console.log(form.data);

			const faculty = await createFaculty(form.data.name);
			return message(form, { message: 'Faculty created', type: 'success', id: faculty.id });
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create faculty', type: 'failure' },
				{ status: 400 }
			);
		}
	}
};
