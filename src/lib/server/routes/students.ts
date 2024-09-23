import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '$lib/db';
import { paginatable } from '$lib/utils';
import { TRPCError } from '@trpc/server';

export const studentRouter = router({
	getStudents: protectedProcedure
		.input(
			paginatable({
				order: z.enum(['asc', 'desc']).optional().default('asc')
			})
		)
		.query(async ({ input, ctx }) => {
			const { order, page, size } = input;
			const userId = ctx.user?.id;

			if (!userId) {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}

			if (ctx.user?.role !== 'ADVISOR') {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
			}

			try {
				const [students, countResult] = await Promise.all([
					db
						.selectFrom('Advisor')
						.where('Advisor.advisor_id', '=', userId)
						.innerJoin('Student', 'Student.id', 'Advisor.student_id')
						.innerJoin('User as StudentUser', 'StudentUser.id', 'Student.user_id')
						.innerJoin('Majors', 'Majors.id', 'Student.major_id')
						.leftJoin('Minors', 'Minors.id', 'Student.minor_id')
						.innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisor_id')
						.select((eb) => [
							'AdvisorUser.name as advisor_name',
							'Student.id as student_id',
							'Student.user_id',
							'StudentUser.name as student_name',
							'StudentUser.email',
							'Majors.name as major',
							'Minors.name as minor',
							eb
								.fn<string>('concat', [
									'Majors.name',
									eb.case().when('Minors.name', 'is not', null).then(' with ').else('').end(),
									eb.fn.coalesce('Minors.name', eb.val(''))
								])
								.as('program_name'),
							'Student.created_at',
							'Student.updated_at',
							'Student.invite_token',
							'Student.invite_expires'
						])
						.limit(size)
						.offset(page * size)
						.orderBy('StudentUser.name', order)
						.execute(),
					db
						.selectFrom('Advisor')
						.where('Advisor.advisor_id', '=', userId)
						.innerJoin('Student', 'Student.id', 'Advisor.student_id')
						.select(db.fn.countAll<number>().as('count'))
						.executeTakeFirst()
				]);

				console.log(students);

				const count = countResult?.count ?? 0;

				return { students, count };
			} catch (err) {
				console.error('Error fetching students:', err);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'An error occurred while fetching students'
				});
			}
		})
});
