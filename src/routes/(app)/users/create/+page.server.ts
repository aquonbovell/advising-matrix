import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { userCreationSchema } from './userCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createUser, exist } from '$lib/server/actions/user.actions';

export const load: PageServerLoad = async ({ locals }) => {
	const role = locals.user?.role;
	if (role !== 'ADMIN') {
		redirect(303, '/');
	}
	return { form: await superValidate(zod(userCreationSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(userCreationSchema));
		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit users', type: 'failure' },
				{ status: 403 }
			);
		}

		if (!form.valid) {
			return fail(404, { form });
		}

		const username = await exist(form.data.username, 'username');
		if (username) {
			form.errors.username = [
				...(form.errors.username ?? ''),
				'Username already exists. Please choose another username'
			];
			return fail(400, { form });
		}

		const email = await exist(form.data.email, 'email');
		if (email) {
			form.errors.email = [
				...(form.errors.email ?? ''),
				'Email already exists. Please choose another email'
			];
			return fail(400, { form });
		}

		const alternateEmail = await exist(form.data.alternateEmail, 'alternateEmail');

		if (alternateEmail) {
			form.errors.alternateEmail = [
				...(form.errors.alternateEmail ?? ''),
				'Alternate email already exists. Please choose another alternate email'
			];
			return fail(400, { form });
		}

		try {
			const userId = await createUser(form.data);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update user', type: 'failure' }, { status: 400 });
		}
		return message(form, { message: 'User created', type: 'success' });
	}
};
