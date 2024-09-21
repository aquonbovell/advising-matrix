import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { restrict } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const order = restrict(url.searchParams.get('order'), ['asc', 'desc']) ?? 'asc';
	const pageIndex = Math.max(0, parseInt(url.searchParams.get('pageIndex') ?? '0', 10));
	const pageSize = Math.max(
		1,
		Math.min(100, parseInt(url.searchParams.get('pageSize') ?? '10', 10))
	);

	try {
		const [courses, countResult] = await Promise.all([
			db
				.selectFrom('Course')
				.select(['id', 'code', 'name', 'level', 'credits'])
				.orderBy('code', order)
				.limit(pageSize)
				.offset(pageIndex * pageSize)
				.execute(),
			db.selectFrom('Course').select(db.fn.countAll<number>().as('count')).executeTakeFirst()
		]);

		const count = countResult?.count ?? 0;

		return {
			courses,
			count
		};
	} catch (err) {
		console.error('Error fetching courses:', err);
		throw error(500, 'An error occurred while fetching the courses');
	}
};
