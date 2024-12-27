import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
	if (!event.locals.session || !event.locals.user) {
		return redirect(307, '/login');
	}
	return { user: event.locals.user };
}) satisfies LayoutServerLoad;
