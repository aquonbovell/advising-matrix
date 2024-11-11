import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import * as auth from '$lib/auth';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(formSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;
		let user;

		try {
			user = await db
				.selectFrom('User')
				.where('email', '=', email)
				.select(['id', 'password', 'role'])
				.executeTakeFirst();

			if (!user) {
				form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or password'];
				form.errors.password = [...(form.errors.password ?? ''), 'Invalid email or password'];
				return fail(400, { form });
			}

			if (user.password === '') {
				form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or password'];
				form.errors.password = [...(form.errors.password ?? ''), 'Invalid email or password'];
				return fail(400, { form });
			}

			const validPassword = await auth.password.verifyPassword(user.password, password);
			if (!validPassword) {
				form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or password'];
				form.errors.password = [...(form.errors.password ?? ''), 'Invalid email or password'];
				return fail(400, { form });
			}

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, user.id);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (error) {
			console.error(error);
			return fail(500, { error });
		}

		return redirect(302, `/${user!.role.toLowerCase()}`);
	}
};
