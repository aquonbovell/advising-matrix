import { fetchUser, updateUser } from '$lib/actions/user.actions';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { userUpdateSchema } from './userUpdate.schema';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const user = await fetchUser(id);
	if (!user) return { status: 404, error: 'User not found' };
	if (user.role === 'ADMIN') return error(403, { message: 'Cannot edit an admin' });
	const form = await superValidate({ ...user, onboarded: !!user.onboarded }, zod(userUpdateSchema));
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(userUpdateSchema));
		if (!form.valid) return fail(404, { form });
		console.log(form.data);

		const username = await db
			.selectFrom('User')
			.where('username', '=', form.data.username)
			.where('id', '!=', form.data.id)
			.select(['username'])
			.executeTakeFirst();
		if (username) {
			form.errors.username = [
				...(form.errors.username ?? ''),
				'Username already exists. Please choose another username'
			];
			return fail(400, { form });
		}

		const email = await db
			.selectFrom('User')
			.where('email', '=', form.data.email)
			.where('id', '!=', form.data.id)
			.select(['email'])
			.executeTakeFirst();
		if (email) {
			form.errors.email = [
				...(form.errors.email ?? ''),
				'Email already exists. Please choose another email'
			];
			return fail(400, { form });
		}

		const alternateEmail = await db
			.selectFrom('User')
			.where('alternateEmail', '=', form.data.alternateEmail)
			.where('id', '!=', form.data.id)
			.select(['alternateEmail'])
			.executeTakeFirst();
		if (alternateEmail) {
			form.errors.alternateEmail = [
				...(form.errors.alternateEmail ?? ''),
				'Alternate email already exists. Please choose another alternate email'
			];
			return fail(400, { form });
		}

		try {
			const userId = await updateUser({ ...form.data, onboarded: form.data.onboarded ? 1 : 0 });
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	}
};
