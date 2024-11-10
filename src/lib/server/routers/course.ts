import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { paginateTable } from '$lib/utils';
import {
	count,
	paginate,
	fetchFilter,
	findByCode,
	remove,
	fetchCourses,
	fetchCourseNames,
	fetchCourseHierarchy
} from '$lib/actions/course.action';

const courseFiltersSchema = z.object({
	level: z.number().optional(),
	departmentId: z.string().optional(),
	excludeCourseIds: z.array(z.string()).optional(),
	order: z.enum(['asc', 'desc']).optional().default('asc')
});

export const courseRouter = router({
	fetch: protectedProcedure
		.input(
			paginateTable({
				orderBy: z.enum(['asc', 'desc']).default('asc'),
				search: z.string().default('')
			})
		)
		.query(async ({ input, ctx }) => {
			const { orderBy, page, size, search } = input;

			try {
				const [courses, total] = await Promise.all([
					paginate(page, size, orderBy, search),
					count()
				]);

				return {
					courses,
					count: total?.count || 0
				};
			} catch (err) {
				console.error('Error fetching courses:', err);
				throw new Error('An error occurred while fetching the courses');
			}
		}),
	findByCode: protectedProcedure.input(z.object({ code: z.string() })).query(async ({ input }) => {
		const { code } = input;

		try {
			const course = await findByCode(code);

			return course;
		} catch (err) {
			console.error('Error fetching course:', err);
			throw new Error('Failed to fetch course');
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
	fetchFilter: protectedProcedure
		.input(z.object({ filters: courseFiltersSchema }))
		.query(async ({ input, ctx }) => {
			const { filters } = input;

			try {
				// Execute queries in parallel
				const courses = await fetchFilter(
					filters.level,
					filters.excludeCourseIds,
					filters.departmentId,
					filters.order
				);

				return {
					courses,
					count: courses.length
				};
			} catch (err) {
				console.error('Error fetching filtered courses:', err);
				throw new Error('Failed to fetch courses');
			}
		}),
	findNames: protectedProcedure.query(async () => {
		try {
			const courses = await fetchCourseNames();

			return {
				courses,
				count: courses.length
			};
		} catch (err) {
			console.error('Error fetching courses:', err);
			throw new Error('Failed to fetch courses');
		}
	}),
	findHierarchy: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const { id } = input;
		try {
			console.log('id', id);

			if (!id) {
				return null;
			}
			const course = await fetchCourseHierarchy(id);
			console.log('course', course);

			return course;
		} catch (err) {
			console.error('Error fetching courses:', err);
			throw new Error('Failed to fetch courses');
		}
	})
});
