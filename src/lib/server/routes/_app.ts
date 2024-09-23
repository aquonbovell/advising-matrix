import { db } from '$lib/db';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const appRouter = router({
	greeting: publicProcedure
		.input(
			z.object({
				name: z.string().optional()
			})
		)
		.query(({ input }) => {
			return `Welcome to ${input.name ?? 'the world'}!`;
		}),
	me: publicProcedure.query(({ ctx }) => {
		return ctx.user;
	}),
	secret: protectedProcedure.query(({ ctx }) => {
		// This is a protected route
		return `Hello, ${ctx.user.email}!`;
	}),
	getCourses: protectedProcedure
		.input(
			z.object({
				order: z.enum(['asc', 'desc']).optional().default('asc'),
				page: z.number().int().min(0).optional().default(0),
				size: z.number().int().min(1).max(100).optional().default(10)
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

export type AppRouter = typeof appRouter;
