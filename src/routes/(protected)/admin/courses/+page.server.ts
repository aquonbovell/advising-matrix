import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}

	try {
		const courses = await db
			.selectFrom('Courses')
			.select(['id', 'code', 'name', 'level', 'credits'])
			.orderBy('code', 'asc')
			.execute();

		return {
			courses
		};
	} catch (err) {
		console.error(err);
		error(500, 'An error occurred while fetching the courses');
	}
};
