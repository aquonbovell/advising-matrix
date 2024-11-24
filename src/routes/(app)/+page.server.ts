import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const { user } = event.locals;
	if (!user) {
		return fail(500, { message: 'User not found' });
	}
	return { user };
}) satisfies PageServerLoad;
