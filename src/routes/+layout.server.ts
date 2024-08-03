import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { user } = locals;

	if (!user && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/register')) {
		throw redirect(303, '/login');
	}

	if (user && url.pathname === '/') {
		throw redirect(303, `/${user.role.toLowerCase()}`);
	}

	return {
		user
	};
};

export const prerender = true
