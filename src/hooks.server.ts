import { lucia } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const preloadFonts: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		preload: ({ type }) => type === 'font'
	});

	return response;
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	console.log(sessionId);

	console.log(event.route);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;

		if (event.route.id?.includes('protected') || event.url.pathname === '/') {
			throw redirect(303, '/login');
		}
		return resolve(event);
	}
	if (sessionId) {
		const { session, user } = await lucia.validateSession(sessionId);
		console.log(session, user);
		if (user || session) {
			event.locals.user = user;
			event.locals.session = session;
			if (
				(event.route.id?.includes('auth') && !event.route.id?.includes('logout')) ||
				event.url.pathname === '/'
			) {
				throw redirect(303, `/${user.role.toLowerCase()}`);
			} else {
				return resolve(event);
			}
		}
		return resolve(event);
	}

	return resolve(event);
};

export const handle = sequence(preloadFonts, handleAuth);
