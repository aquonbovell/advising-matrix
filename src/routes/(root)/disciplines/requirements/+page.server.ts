import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getRequirements, loadRequirements } from '$lib/server/actions/requirements.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	return { requriements: await getRequirements() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	load: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return redirect(302, '/login');
		}

		if (event.locals.user.role !== 'admin') {
			fail(403, { message: 'Forbidden' });
		}

		const load = await loadRequirements();

		return { success: load };
	}
};
