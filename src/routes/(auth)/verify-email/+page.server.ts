import { updateUserEmailAndSetEmailAsVerified } from '$lib/server/actions/user.actions';
import {
	createEmailVerificationRequest,
	deleteEmailVerificationRequestCookie,
	deleteUserEmailVerificationRequest,
	getUserEmailVerificationRequestFromRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/auth/email-verification';
import { invalidateUserPasswordResetSessions } from '$lib/server/auth/password-reset';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
	if (!event.locals.session || !event.locals.user) {
		return redirect(302, '/login');
	}
	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null || Date.now() >= verificationRequest.expiresAt.getTime()) {
		if (event.locals.user.emailVerified) {
			return redirect(302, '/2fa/setup');
		}

		// Note: We don't need rate limiting since it takes time before requests expire
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			event.locals.user.email
		);
		sendVerificationEmail(verificationRequest.email, verificationRequest.code);
		setEmailVerificationRequestCookie(event, verificationRequest);
	}
	return {
		email: verificationRequest.email
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	verify: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return fail(401, {
				verify: {
					message: 'Not authenticated'
				}
			});
		}
		if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
			return fail(403, {
				verify: {
					message: 'Forbidden'
				}
			});
		}

		let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
		if (verificationRequest === null) {
			return fail(401, {
				verify: {
					message: 'Not authenticated'
				}
			});
		}
		const formData = await event.request.formData();
		const code = formData.get('code');
		if (typeof code !== 'string') {
			return fail(400, {
				verify: {
					message: 'Invalid or missing fields'
				}
			});
		}
		if (code === '') {
			return fail(400, {
				verify: {
					message: 'Enter your code'
				}
			});
		}

		if (Date.now() >= verificationRequest.expiresAt.getTime()) {
			verificationRequest = await createEmailVerificationRequest(
				verificationRequest.userId,
				verificationRequest.email
			);
			sendVerificationEmail(verificationRequest.email, verificationRequest.code);
			return {
				verify: {
					message: 'The verification code was expired. We sent another code to your inbox.'
				}
			};
		}
		if (verificationRequest.code !== code) {
			return fail(400, {
				verify: {
					message: 'Incorrect code.'
				}
			});
		}
		await deleteUserEmailVerificationRequest(event.locals.user.id);
		invalidateUserPasswordResetSessions(event.locals.user.id);
		updateUserEmailAndSetEmailAsVerified(event.locals.user.id, verificationRequest.email);
		deleteEmailVerificationRequestCookie(event);
		if (!event.locals.user.registered2FA) {
			return redirect(302, '/2fa/setup');
		}
		return redirect(302, '/2fa');
	},
	resend: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return fail(401, {
				resend: {
					message: 'Not authenticated'
				}
			});
		}
		if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
			return fail(403, {
				resend: {
					message: 'Forbidden'
				}
			});
		}

		let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
		if (verificationRequest === null) {
			if (event.locals.user.emailVerified) {
				return fail(403, {
					resend: {
						message: 'Forbidden'
					}
				});
			}

			verificationRequest = await createEmailVerificationRequest(
				event.locals.user.id,
				event.locals.user.email
			);
		} else {
			verificationRequest = await createEmailVerificationRequest(
				event.locals.user.id,
				verificationRequest.email
			);
		}
		sendVerificationEmail(verificationRequest.email, verificationRequest.code);
		setEmailVerificationRequestCookie(event, verificationRequest);
		return {
			resend: {
				message: 'A new code was sent to your inbox.'
			}
		};
	}
};
