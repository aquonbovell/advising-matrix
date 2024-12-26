import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserRecoverCode } from '$lib/server/actions/user.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (!event.locals.session.twoFactorVerified) {
		return redirect(302, '/2fa');
	}

	const recoveryCode = await getUserRecoverCode(event.locals.user.id);
	return {
		recoveryCode
	};
}) satisfies PageServerLoad;
