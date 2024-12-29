import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFaculties } from '$lib/server/actions/faculty.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	return { faculties: await getFaculties() };
}) satisfies PageServerLoad;
