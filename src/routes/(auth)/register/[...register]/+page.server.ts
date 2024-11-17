import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { registerSchema } from './register.schema';
import { fail, redirect } from '@sveltejs/kit';
import { createUser } from '$lib/actions/user.actions';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(registerSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		console.log('register');

		const form = await superValidate(event, zod(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
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
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, new Date(session.expiresAt));
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return redirect(303, '/onboarding');
	}
};
