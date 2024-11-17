import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { userCreationSchema } from './userCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createUser } from '$lib/actions/user.actions';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(userCreationSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(userCreationSchema));

		if (!form.valid) {
			return fail(404, { form });
		}

		console.log(form.data);
		const username = await db
			.selectFrom('User')
			.where('username', '=', form.data.username)
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
			const userId = await createUser(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	}
};
