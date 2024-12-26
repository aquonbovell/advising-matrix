import { loginSchema } from '$lib/schemas/login';
import { getPasswordHashFromId, getUserFromEmail } from '$lib/server/actions/user.actions';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = (async () => {
	return { form: await superValidate(zod(loginSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(loginSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const user = await getUserFromEmail(form.data.email);

		if (!user) {
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email'];
			form.errors.password = [...(form.errors.password ?? ''), 'Invalid password'];
			form.data.password = '';
			return fail(400, { form });
		}

		const passwordHash = await getPasswordHashFromId(user.id);

		if (!passwordHash) {
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email'];
			form.errors.password = [...(form.errors.password ?? ''), 'Invalid password'];
			form.data.password = '';
			return fail(400, { form });
		}

		const isPasswordValid = await auth.validPassword(form.data.password, passwordHash);

		if (!isPasswordValid) {
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email'];
			form.errors.password = [...(form.errors.password ?? ''), 'Invalid password'];
			form.data.password = '';
			return fail(400, { form });
		}

		const sessionFlags: auth.SessionFlags = {
			twoFactorVerified: false
		};

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, user.id, sessionFlags);
		auth.setSessionTokenCookie(event, sessionToken, new Date(session.expiresAt));

		return redirect(302, '/verify-email');
	}
};
