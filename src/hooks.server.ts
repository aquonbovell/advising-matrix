import { redirect, type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		if (event.route.id && event.route.id.includes('root')) {
			throw redirect(307, '/login');
		}
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		if (
			event.route.id &&
			(event.route.id.includes('login') || event.route.id.includes('register'))
		) {
			throw redirect(307, '/verify-email');
		}

		if (!user.emailVerified && event.route.id && !event.route.id.includes('verify-email')) {
			throw redirect(307, '/verify-email');
		}

		if (
			user.emailVerified &&
			!user.registered2FA &&
			event.route.id &&
			!event.route.id.includes('2fa/setup')
		) {
			throw redirect(307, '/2fa/setup');
		}

		if (
			user.registered2FA &&
			!session.twoFactorVerified &&
			event.route.id &&
			!event.route.id.includes('2fa') &&
			!event.route.id.includes('2fa/setup')
		) {
			throw redirect(307, '/2fa');
		}
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = handleAuth;
