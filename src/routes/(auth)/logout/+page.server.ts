import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return redirect(303, '/login');
};

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		console.log(locals.session, 'log');
		if (!locals.session) {
			return fail(401, { error: 'Unauthorized' });
		}

		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// Redirect to login page
		redirect(302, '/login');
	}
};
