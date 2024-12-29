import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDepartments } from '$lib/server/actions/department.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	return { departments: await getDepartments() };
}) satisfies PageServerLoad;
