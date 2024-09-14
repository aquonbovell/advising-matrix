import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/db';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { Argon2id } from 'oslo/password';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(formSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const password = form.data.password;

		const user = await db
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

		const encoder = new TextEncoder();
		const secret = encoder.encode(process.env.SECRET!);
		const argon2id = new Argon2id({ secret });

		const validPassword = await argon2id.verify(user.password, password);

		if (!validPassword) {
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or password'];
			form.errors.password = [...(form.errors.password ?? ''), 'Invalid email or password'];
			return fail(400, { form });
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, `/${user.role.toLowerCase()}`);
	}
};
