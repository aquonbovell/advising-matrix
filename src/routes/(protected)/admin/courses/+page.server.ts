import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	try {
		const courses = await db
			.selectFrom('Course')
			.select(['id', 'code', 'name', 'level', 'credits'])
			.orderBy('code', 'asc')
			.execute();

		setHeaders({ 'Cache-Control': 'max-age=0, s-max-age=3600' });

		return {
			courses
		};
	} catch (err) {
		console.error(err);
		throw error(500, 'An error occurred while fetching the advisor');
	}
};
