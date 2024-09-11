import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	return {};
}) satisfies PageServerLoad;
