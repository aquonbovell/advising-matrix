import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { advisorSchema } from '$lib/schemas/user';
import { error, fail, redirect } from '@sveltejs/kit';
import {
	checkEmailAvailability,
	checkUsernameAvailability,
	createUser
} from '$lib/server/actions/user.actions';
import { minorCreationSchema } from '$lib/schemas/minor';
import { checkMinorAvailability, createMinor } from '$lib/server/actions/minor.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}
	return { form: await superValidate(zod(minorCreationSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(minorCreationSchema));

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

		const name = await checkMinorAvailability(form.data.name);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Minor already exists. Please choose another name'
			];
			return fail(400, { form });
		}

		try {
			console.log('Creating minor');

			console.log(form.data);

			const minor = await createMinor(form.data.name);
			return message(form, { message: 'minor created', type: 'success', id: minor.id });
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to create minor', type: 'failure' }, { status: 400 });
		}
	}
};
