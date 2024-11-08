import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { restrict } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	return {};
};
