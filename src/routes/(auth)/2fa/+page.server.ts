import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { twoFAVerifySchema } from '$lib/schemas/twoFactor';
import { getUserTOTPKey } from '$lib/server/actions/user.actions';
import { setSessionAs2FAVerified } from '$lib/server/auth';
import { authenticator } from 'otplib';

export const load = (async (event) => {
	if (!event.locals.session || !event.locals.user) {
		return redirect(302, '/login');
	}

	if (event.locals.session.twoFactorVerified) {
		return redirect(302, '/dashboard');
	}

	if (!event.locals.user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}

	return { form: await superValidate(zod(twoFAVerifySchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return fail(401, {
				message: 'Not authenticated'
			});
		}
		if (
			!event.locals.user.emailVerified ||
			!event.locals.user.registered2FA ||
			event.locals.session.twoFactorVerified
		) {
			return fail(403, {
				message: 'Forbidden'
			});
		}
		const form = await superValidate(event.request, zod(twoFAVerifySchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const totpKey = await getUserTOTPKey(event.locals.user.id);
		if (totpKey === null) {
			form.errors.code = [...(form.errors.code ?? ''), 'Forbidden'];
			return fail(403, { form });
		}

		if (
			!authenticator.verify({
				token: form.data.code,
				secret: Buffer.copyBytesFrom(totpKey).toString()
			})
		) {
			form.errors.code = [...(form.errors.code ?? ''), 'Invalid code'];
			return fail(400, { form });
		}
		await setSessionAs2FAVerified(event.locals.session.id);
		return redirect(302, '/');
	}
};
