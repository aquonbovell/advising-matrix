import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async () => {
	throw redirect(303, '/advisor/courses');
}) satisfies PageLoad;
