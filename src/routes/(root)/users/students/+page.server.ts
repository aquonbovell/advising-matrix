import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getStudents } from '$lib/server/actions/student.actions';
import { loadUsers } from '$lib/server/actions/user.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	return { students: await getStudents() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	load: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return redirect(302, '/login');
		}

		if (event.locals.user.role !== 'admin') {
			fail(403, { message: 'Forbidden' });
		}

		const load = await loadUsers();

		return { success: load };
	}
};
