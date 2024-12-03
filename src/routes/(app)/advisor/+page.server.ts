import { fetchAdvisors } from '$lib/server/actions/student.actions';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const id = locals.user?.id;
	if (!id) {
		return { status: 401, error: new Error('Unauthorized') };
	}
	return { advisors: await fetchAdvisors(id) };
}) satisfies PageServerLoad;
