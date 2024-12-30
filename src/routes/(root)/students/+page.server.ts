import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getStudentsFromAdvisorId } from '$lib/server/actions/advising.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'advisor' && event.locals.user.role !== 'superadvisor') {
		error(403, 'Forbidden');
	}

	return { students: await getStudentsFromAdvisorId(event.locals.user.id, event.locals.user.role) };
}) satisfies PageServerLoad;
