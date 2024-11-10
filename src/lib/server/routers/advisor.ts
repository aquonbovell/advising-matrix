import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { paginateTable } from '$lib/utils';
import { countStudents, paginateStudents } from '$lib/actions/advisor.action';
import { overview } from '$lib/actions/student.actions';

export const advisorRouter = router({
	students: protectedProcedure
		.input(
			paginateTable({
				orderBy: z.enum(['asc', 'desc']).default('asc'),
				search: z.string().default(''),
				mode: z.enum(['all', 'mine']).default('all')
			})
		)
		.query(async ({ input, ctx }) => {
			const { orderBy, page, size, search, mode } = input;

			try {
				const [students, total] = await Promise.all([
					paginateStudents(page, size, ctx.user.id, search, orderBy, mode),
					countStudents(ctx.user.id, mode)
				]);

				return {
					students,
					count: total
				};
			} catch (err) {
				console.error('Error fetching students:', err);
				throw new Error('An error occurred while fetching the students');
			}
		}),
	studentOverview: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { id } = input;

			try {
				const data = await overview(id);

				return { student: data };
			} catch (err) {
				console.error('Error fetching students:', err);
				throw new Error('An error occurred while fetching the students');
			}
		})
});
