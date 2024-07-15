import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isValidEmail } from '$lib/utils';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, `/${locals.user.role.toLowerCase()}`);
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email');
		const password = form.get('password');

		if (!email || typeof email !== 'string' || !isValidEmail(email)) {
			return fail(400, { error: 'Invalid email' });
		}

		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Invalid password' });
		}

		const user = await db
			.selectFrom('User')
			.where('email', '=', email)
			.selectAll()
			.executeTakeFirst();

		if (!user) {
			return fail(400, { error: 'Invalid email or password' });
		}

		const validPassword = await new Argon2id().verify(user.password, password);
		if (!validPassword) {
			return fail(400, { error: 'Invalid email or password' });
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, `/${user.role.toLowerCase()}`);
	}
};
