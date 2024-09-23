import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '$lib/db';
import { paginatable } from '$lib/utils';

export const courseRouter = router({
	getCourses: protectedProcedure
		.input(
			paginatable({
				order: z.enum(['asc', 'desc']).optional().default('asc')
			})
		)
		.query(async ({ input, ctx }) => {
			const { order, page, size } = input;

			try {
				const [courses, countResult] = await Promise.all([
					db
						.selectFrom('Course')
						.select(['id', 'code', 'name', 'level', 'credits'])
						.orderBy('code', order)
						.limit(size)
						.offset(page * size)
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
				throw new Error('An error occurred while fetching the courses');
			}
		})
});
