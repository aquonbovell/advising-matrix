import { fail, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { user } = event.locals;
	if (!user) {
		return redirect(307, '/login');
	}
	return { user };
};
