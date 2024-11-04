import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async () => {
	return redirect(303, '/advisor/advising-students');
}) satisfies PageLoad;
