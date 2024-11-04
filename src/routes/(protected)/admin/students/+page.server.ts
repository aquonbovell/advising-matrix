import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}
	try {
		const users = await db
			.selectFrom('User')
			.where('User.role', '=', 'STUDENT')
			.innerJoin('Student', 'Student.user_id', 'User.id')
			.select(['Student.id', 'name', 'email', 'role', 'alternate_email'])
			.execute();
		return { users };
	} catch (err) {
		console.error(err);
		error(500, 'An error occurred while fetching the courses');
	}
}) satisfies PageServerLoad;
