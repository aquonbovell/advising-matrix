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

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}
	return { form: await superValidate(zod(advisorSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(advisorSchema));

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

		const username = await checkUsernameAvailability(form.data.username);
		if (!username) {
			form.errors.username = [
				...(form.errors.username ?? ''),
				'Username already exists. Please choose another username'
			];
			return fail(400, { form });
		}

		const email = await checkEmailAvailability(form.data.email);
		if (!email) {
			form.errors.email = [
				...(form.errors.email ?? ''),
				'Email already exists. Please choose another email'
			];
			return fail(400, { form });
		}

		try {
			console.log('Creating user');

			console.log(form.data);

			const user = await createUser(form.data.username, form.data.email, 'advisor');
			return message(form, { message: 'Advisor created', type: 'success', id: user.id });
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create advisor', type: 'failure' },
				{ status: 400 }
			);
		}
	}
};
