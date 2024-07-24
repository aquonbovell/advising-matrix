import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load = (async ({ locals, params }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const data = await db
		.selectFrom('User')
		.select(['User.email', 'User.id', 'User.name', 'created_at', 'updated_at', 'User.role'])
		.where('User.id', '=', params.id)
		.executeTakeFirst();

	if (!data) {
		throw error(404, 'Not found');
	}

	if (data.role !== 'STUDENT') {
		throw error(403, 'Forbidden');
	}

	return { student: data };
}) satisfies PageServerLoad;
