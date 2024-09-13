import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return redirect(303, '/forgot-password');
}) satisfies PageServerLoad;
