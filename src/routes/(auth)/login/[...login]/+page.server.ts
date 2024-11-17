import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import * as auth from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from './login.schema';
import { fail, redirect } from '@sveltejs/kit';
import { getUserByCredentials } from '$lib/actions/user.actions';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(loginSchema)) };
};
export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const userId = await getUserByCredentials(form.data.email, form.data.password);
		if (!userId) {
			return fail(400, { form });
		}
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);
		auth.setSessionTokenCookie(event, sessionToken, new Date(session.expiresAt));
		return redirect(302, '/');
	}
};
