import { deleteUser, exist, fetchUser, updateUser } from '$lib/actions/user.actions';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { userUpdateSchema } from './userUpdate.schema';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const role = locals.user?.role;

	if (role !== 'ADMIN') {
		redirect(303, '/');
	}

	const { id } = params;
	const user = await fetchUser(id);
	const form = await superValidate({ ...user, onboarded: !!user.onboarded }, zod(userUpdateSchema));
	return { form };
};

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(userUpdateSchema));
		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit users', type: 'failure' },
				{ status: 403 }
			);
		}
		if (!form.valid) return fail(404, { form });

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
			await updateUser({ ...form.data, onboarded: form.data.onboarded ? 1 : 0 });
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update user', type: 'failure' }, { status: 400 });
		}
		return message(form, { message: 'User updated', type: 'success' });
	},
	delete: async ({ params, locals, request }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete users' });
		}
		const { id } = params;
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteUser(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete user' });
		}
		return { success: true };
	}
};
