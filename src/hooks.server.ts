import { redirect, type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		if (event.route.id?.includes('app')) {
			throw redirect(307, '/login');
		}
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, new Date(session.expiresAt));

		if (event.route.id?.includes('auth') && !event.route.id.includes('logout')) {
			throw redirect(307, '/');
		}
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = handleAuth;
