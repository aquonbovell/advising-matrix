import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/db';
import { superValidate } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';
import { loginSchema } from './schema';
import { verifyPassword } from '$lib/utils';

const defaults = { email: '', password: '' };

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, `/${locals.user.role.toLowerCase()}`);
	}

	const loginForm = await superValidate(vine(loginSchema, { defaults }));

	return { loginForm };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, vine(loginSchema, { defaults }));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const password = form.data.password;

		const user = await db
			.selectFrom('User')
			.where('email', '=', email)
			.selectAll()
			.executeTakeFirst();

		if (!user) {
			form.errors._errors = ['Invalid email or password'];
			return fail(400, { form });
		}

		if (user.password == '') {
			form.errors._errors = ['Invalid email or password'];
			return fail(400, { form });
		}

		const validPassword = await verifyPassword(user.password, password);
		if (!validPassword) {
			form.errors._errors = ['Invalid email or password'];
			return fail(400, { form });
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
