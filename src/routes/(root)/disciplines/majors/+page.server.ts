import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getMajors, loadMajors } from '$lib/server/actions/major.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	return { majors: await getMajors() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	load: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return redirect(302, '/login');
		}

		if (event.locals.user.role !== 'admin') {
			fail(403, { message: 'Forbidden' });
		}

		const load = await loadMajors();

		return { success: load };
	}
};
