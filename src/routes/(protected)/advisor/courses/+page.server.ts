import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { restrict } from '$lib/utils';
import { trpcServer } from '$lib/server/server';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	return {};
};
