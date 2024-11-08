import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { paginateTable } from '$lib/utils';
import { TRPCError } from '@trpc/server';
import { GRADE_VALUES } from '$lib/types';
import type { NonNullableGrade } from '$lib/types';
import { fetchMyStudents, fetchStudents } from '$lib/actions/advisor.action';
import { fetchDegree } from '$lib/actions/degree.actions';
import { fetchStudentCourses, updateStudentGrades } from '$lib/actions/student.actions';
import { fetchCourseCodes } from '$lib/actions/course.action';

const UpdateGradeInputSchema = z.object({
	courseId: z.string(),
	grades: z.array(z.enum(Object.values(GRADE_VALUES) as [NonNullableGrade, ...NonNullableGrade[]])),
	requirementId: z.string().uuid(),
	userId: z.string().or(z.null())
});

export const studentRouter = router({
	findManyStudents: protectedProcedure
		.input(
			paginateTable({
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
				const data = await fetchStudents(size, page, order);
				return { ...data };
			} catch (err) {
				console.error('Error fetching students:', err);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'An error occurred while fetching students'
				});
			}
		}),
	findMyStudents: protectedProcedure
		.input(
			paginateTable({
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
				const data = await fetchMyStudents(userId, size, page, order);

				return { ...data };
			} catch (err) {
				console.error('Error fetching students:', err);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'An error occurred while fetching students'
				});
			}
		}),

	// getStudentCourses: protectedProcedure.query(async ({ ctx }) => {
	// 	const student = await db
	// 		.selectFrom('Student')
	// 		.select(['id'])
	// 		.where('user_id', '=', ctx.user.id)
	// 		.executeTakeFirst();

	// 	if (!student) {
	// 		throw new TRPCError({
	// 			code: 'NOT_FOUND',
	// 			message: 'Student not found at getStudentCourses'
	// 		});
	// 	}

	// 	const courses = await db
	// 		.selectFrom('StudentCourses')
	// 		.innerJoin('Course', 'Course.id', 'StudentCourses.courseId')
	// 		.select([
	// 			'StudentCourses.id as id',
	// 			'StudentCourses.courseId',
	// 			'StudentCourses.requirementId',
	// 			'StudentCourses.grade',
	// 			'Course.credits'
	// 		])
	// 		.where('StudentCourses.studentId', '=', student.id)
	// 		.execute();

	// 	return { courses };
	// }),

	// getStudentProgram: protectedProcedure.query(async ({ ctx }) => {
	// 	const program = await db
	// 		.selectFrom('Student')
	// 		.select(['id', 'major_id', 'minor_id'])
	// 		.where('user_id', '=', ctx.user.id)
	// 		.executeTakeFirst();

	// 	if (!program) {
	// 		throw new TRPCError({
	// 			code: 'NOT_FOUND',
	// 			message: 'Student not found at getStudentProgram'
	// 		});
	// 	}

	// 	return { program };
	// }),

	findCodes: protectedProcedure.query(async ({ ctx }) => {
		return await fetchCourseCodes();
	}),

	findStudent: protectedProcedure
		.input(
			z.object({
				majorId: z.string().uuid(),
				minorId: z.string().uuid()
			})
		)
		.query(async ({ input, ctx }) => {
			const { majorId, minorId } = input;
			const degree = await fetchDegree(majorId, minorId);

			return { ...degree };
		}),

	findStudentGrades: protectedProcedure
		.input(
			z.object({
				studentId: z.string().uuid()
			})
		)
		.query(async ({ input }) => {
			const { studentId } = input;

			const grades = await fetchStudentCourses(studentId);

			return { ...grades };
		}),

	updatestudentGrades: protectedProcedure
		.input(z.object({ grades: z.array(UpdateGradeInputSchema), studentId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			updateStudentGrades(input.studentId, input.grades);
		})
});
