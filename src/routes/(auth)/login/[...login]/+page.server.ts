import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import * as auth from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from '$lib/schemas/login';
import { fail, redirect } from '@sveltejs/kit';
import { fetchUserByEmail, verifyUserByCredentials } from '$lib/server/actions/user.actions';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = locals;
	if (session && user) {
		return redirect(307, '/');
	}
	return { form: await superValidate(zod(loginSchema)) };
};
export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		const user = await verifyUserByCredentials(form.data.email, form.data.password);

		if (!user) {
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or password'];
			form.errors.password = [...(form.errors.password ?? ''), 'Invalid email or password'];
			form.data.password = '';
			return fail(400, { form });
		}
		const userId = await fetchUserByEmail(form.data.email);
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);
		auth.setSessionTokenCookie(event, sessionToken, new Date(session.expiresAt));

		return redirect(302, '/onboarding');
	}
};
