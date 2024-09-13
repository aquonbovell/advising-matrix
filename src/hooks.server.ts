import { lucia } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	console.log(sessionId);

	console.log(event.route);

	if (!sessionId) {
		if (event.route.id?.includes('protected') || event.url.pathname === '/') {
			console.log('redirecting');

			throw redirect(303, '/login');
		}
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	console.log(session);

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		if (event.route.id?.includes('protected') || event.url.pathname === '/') {
			throw redirect(303, '/login');
		}
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

export const handle = sequence(handleAuth, handleRole);
