import { dev } from '$app/environment';
import { validateSessionToken } from '$lib/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const preloadFonts: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		preload: ({ type }) => type === 'font'
	});

	return response;
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(sessionToken);

	if (session) {
		event.cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			expires: session.expiresAt,
			secure: !dev
		});
	} else {
		event.cookies.delete('session', {
			path: '/'
		});
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

const handleRole: Handle = async ({ event, resolve }) => {
	const { user } = event.locals;
	if (event.route.id?.includes('logout')) {
		return resolve(event);
	}
	if (event.route.id?.includes('api')) {
		return resolve(event);
	}

	if (user && user.role === 'ADMIN' && !event.route.id?.includes('admin')) {
		throw redirect(303, '/admin');
	}
	if (user && user.role === 'ADVISOR' && !event.route.id?.includes('advisor')) {
		throw redirect(303, '/advisor');
	}
	if (user && user.role === 'STUDENT' && !event.route.id?.includes('student')) {
		throw redirect(303, '/student');
	}
	return resolve(event);
};

export const handle = sequence(preloadFonts, handleAuth, handleRole);
