import { authenticator } from 'otplib';
import { fail, redirect } from '@sveltejs/kit';
import { updateUserTOTPKey } from '$lib/server/auth/encryption';
import { setSessionAs2FAVerified } from '$lib/server/auth';
import { renderSVG } from 'uqr';
import { twoFASchema } from '$lib/schemas/twoFactor';

import type { Actions, RequestEvent } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';

export async function load(event: RequestEvent) {
	if (!event.locals.session || !event.locals.user) {
		return redirect(302, '/login');
	}

	if (event.locals.user.registered2FA) {
		return redirect(302, '/2fa');
	}

	const encodedTOTPKey = authenticator.generateSecret(20);

	const keyURI = authenticator.keyuri('FST Demo', event.locals.user.email, encodedTOTPKey);

	const qrcode = renderSVG(keyURI);

	const form = await superValidate(event.request, zod(twoFASchema));

	form.data.encodedKey = encodedTOTPKey;

	return {
		qrcode,
		form
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	if (!event.locals.user.emailVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}

	const form = await superValidate(event.request, zod(twoFASchema));
	if (!form.valid) {
		return fail(400, {
			form
		});
	}

	console.log(form.data);

	let key = form.data.encodedKey;
	try {
		if (!authenticator.verify({ token: form.data.code, secret: key })) {
			form.errors.code = [...(form.errors.code ?? ''), 'Invalid code'];
			return fail(400, { form });
		}
	} catch {
		form.errors.code = [...(form.errors.code ?? ''), 'Invalid codeer'];
		return fail(400, { form });
	}

	await updateUserTOTPKey(event.locals.session.userId, Buffer.from(key));
	await setSessionAs2FAVerified(event.locals.session.id);
	return redirect(302, '/recovery-code');
}
