import {} from '$lib/server/actions/user.actions';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	return {};
};
