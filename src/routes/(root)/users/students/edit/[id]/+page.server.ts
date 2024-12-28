import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { advisorUpdateSchema } from '$lib/schemas/user';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	checkEmailAvailability,
	checkUsernameAvailability,
	deleteUserFromId,
	getUserFromId,
	updateUser
} from '$lib/server/actions/user.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const identity = await getUserFromId(event.params.id, ['student']);

	if (!identity) {
		error(404, 'User not found');
	}

	const form = await superValidate(zod(advisorUpdateSchema));

	form.data = {
		id: identity.id,
		role: identity.role,
		username: identity.username,
		email: identity.email
	};
	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(advisorUpdateSchema));

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
			console.log('Updating user');

			console.log(form.data);

			await updateUser(form.data.id, form.data.username, form.data.email, form.data.role);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update advisor', type: 'failure' },
				{ status: 400 }
			);
		}
		return redirect(302, `/users/${form.data.role}s/show/${form.data.id}`);
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
				message: "Enter the user's Id"
			});
		}

		const deleted = await deleteUserFromId(id);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
