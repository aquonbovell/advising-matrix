import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDisciplineFromStudentId } from '$lib/server/actions/matrix.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'advisor' && event.locals.user.role !== 'superadvisor') {
		error(403, 'Forbidden');
	}

	const discipline = await getDisciplineFromStudentId(event.params.id);

	return { discipline };
}) satisfies PageServerLoad;
