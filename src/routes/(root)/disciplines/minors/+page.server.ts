import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getStudents } from '$lib/server/actions/student.actions';
import { getMinors, loadMinors } from '$lib/server/actions/minor.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	return { minors: await getMinors() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	load: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return redirect(302, '/login');
		}

		if (event.locals.user.role !== 'admin') {
			fail(403, { message: 'Forbidden' });
		}

		const load = await loadMinors();

		return { success: load };
	}
};
