import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async () => {
	return redirect(303, '/login');
}) satisfies PageLoad;
