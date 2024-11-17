import { db } from '$lib/server/db';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
	const { user } = event.locals;
	if (!user) {
		return fail(500, { message: 'User not found' });
	}
	return { user };
}) satisfies PageServerLoad;
