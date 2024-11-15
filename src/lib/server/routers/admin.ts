import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { paginateTable } from '$lib/utils';
import { count, paginate, paginateStudents, remove } from '$lib/actions/admin.action';
import { fetchMinorsCount, fetchPaginatedMinors } from '$lib/actions/minor.actions';
import { fetchFaculties } from '$lib/actions/faculty.action';
import { fetchCourseNames } from '$lib/actions/course.action';

export const adminRouter = router({
	users: protectedProcedure
		.input(
			paginateTable({
				orderBy: z.enum(['asc', 'desc']).default('asc'),
				search: z.string().default('')
			})
		)
		.query(async ({ input, ctx }) => {
			const { orderBy, page, size, search } = input;

			try {
				const [users, total] = await Promise.all([paginate(page, size, orderBy, search), count()]);

				return {
					users,
					count: total?.count || 0
				};
			} catch (err) {
				console.error('Error fetching courses:', err);
				throw new Error('An error occurred while fetching the courses');
			}
		}),
	students: protectedProcedure
		.input(
			paginateTable({
				orderBy: z.enum(['asc', 'desc']).default('asc'),
				search: z.string().default('')
			})
		)
		.query(async ({ input, ctx }) => {
			const { orderBy, page, size, search } = input;

			try {
				const [students, total] = await Promise.all([
					paginateStudents(page, size, orderBy, search),
					count()
				]);

				return {
					students,
					count: total?.count || 0
				};
			} catch (err) {
				console.error('Error fetching courses:', err);
				throw new Error('An error occurred while fetching the courses');
			}
		}),
	findById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const { id } = input;

		try {
		} catch (err) {
			console.error('Error finding user:', err);
			throw new Error('Failed to find user');
		}
	}),
	delete: protectedProcedure.input(z.object({ code: z.string() })).query(async ({ input }) => {
		const { code } = input;

		try {
			const result = await remove(code);

			if (!result.success) {
				throw new Error('Failed to delete course');
			}

			return result;
		} catch (err) {
			console.error('Error deleting course:', err);
			throw new Error('Failed to delete course');
		}
	}),
	minors: protectedProcedure
		.input(
			paginateTable({
				orderBy: z.enum(['asc', 'desc']).default('asc'),
				search: z.string().default('')
			})
		)
		.query(async ({ input, ctx }) => {
			const { orderBy, page, size, search } = input;
			try {
				const [minors, count] = await Promise.all([
					fetchPaginatedMinors(page, size, search, orderBy),
					fetchMinorsCount()
				]);
				return { minors, count: count?.count || 0 };
			} catch (err) {
				console.error('Error fetching minors:', err);
				throw err;
			}
		}),

	faculties: protectedProcedure.query(async () => {
		try {
			const faculties = await fetchFaculties();
			return faculties;
		} catch (err) {
			console.error('Error fetching faculties:', err);
			throw err;
		}
	}),
	courseNames: protectedProcedure.query(async () => {
		try {
			const courses = await fetchCourseNames();
			return courses;
		} catch (err) {
			console.error('Error fetching course names:', err);
			throw err;
		}
	})
});
