import { registerSchema } from '$lib/schemas/register';
import {
	checkEmailAvailability,
	checkUsernameAvailability,
	createUser
} from '$lib/server/actions/user.actions';
import * as auth from '$lib/server/auth';
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/auth/email-verification';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';

export const load = (async () => {
	return { form: await superValidate(zod(registerSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(registerSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const usernameAvailable = await checkUsernameAvailability(form.data.username);

		if (!usernameAvailable) {
			form.errors.username = [...(form.errors.username ?? ''), 'Username already in use'];
			form.data.password = '';
			form.data.passwordConfirm = '';
			return fail(400, { form });
		}

		const emailAvailable = await checkEmailAvailability(form.data.email);

		if (!emailAvailable) {
			form.errors.email = [...(form.errors.email ?? ''), 'Email already in use'];
			form.data.password = '';
			form.data.passwordConfirm = '';
			return fail(400, { form });
		}

		if (form.data.password !== form.data.passwordConfirm) {
			form.errors.password = [...(form.errors.password ?? ''), 'Passwords do not match'];
			form.data.password = '';
			form.data.passwordConfirm = '';
			return fail(400, { form });
		}

		const user = await createUser(form.data.username, form.data.email, form.data.password);
		const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
		sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
		setEmailVerificationRequestCookie(event, emailVerificationRequest);

		const sessionFlags: auth.SessionFlags = {
			twoFactorVerified: false
		};

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, user.id, sessionFlags);
		auth.setSessionTokenCookie(event, sessionToken, new Date(session.expiresAt));
		return redirect(302, '/verify-email');
	}
};
