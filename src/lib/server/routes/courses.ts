import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '$lib/db';
import { paginatable } from '$lib/utils';
import type { CourseWithPrerequisites } from '$lib/types';

const CourseFiltersSchema = z.object({
	level: z.number().optional(),
	departmentId: z.string().optional(),
	excludeCourseIds: z.array(z.number()).optional(),
	order: z.enum(['asc', 'desc']).optional().default('asc')
});

async function getPrerequisites(
	courseId: number,
	visited = new Set<number>()
): Promise<CourseWithPrerequisites | null> {
	if (visited.has(courseId)) return null;
	visited.add(courseId);

	const course = await db
		.selectFrom('Course')
		.where('Course.id', '=', courseId)
		.select(['id', 'code', 'name', 'level', 'credits', 'departmentId'])
		.executeTakeFirst();

	if (!course) return null;

	const prerequisites = await db
		.selectFrom('CoursePrerequisite')
		.innerJoin('Course', 'Course.id', 'CoursePrerequisite.prerequisiteId')
		.where('CoursePrerequisite.courseId', '=', courseId)
		.select([
			'Course.id',
			'Course.code',
			'Course.name',
			'Course.level',
			'Course.credits',
			'Course.departmentId'
		])
		.execute();

	const prereqsWithHierarchy = await Promise.all(
		prerequisites.map(async (prereq) => {
			return await getPrerequisites(prereq.id, new Set(visited));
		})
	);

	return {
		...course,
		prerequisites: prereqsWithHierarchy.filter((p): p is CourseWithPrerequisites => p !== null)
	};
}

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
		}),
	getSpecificCourse: protectedProcedure
		.input(z.object({ code: z.string() }))
		.query(async ({ input }) => {
			const { code } = input;

			try {
				const course = await db
					.selectFrom('Course')
					.select(['id', 'code', 'name', 'level', 'credits', 'departmentId'])
					.where('code', '=', code)
					.executeTakeFirst();

				if (!course) {
					throw new Error('Course not found');
				}

				const prerequisites = await getPrerequisites(course.id);
				return prerequisites;
			} catch (err) {
				console.error('Error fetching course:', err);
				throw new Error('Failed to fetch course');
			}
		}),
	getFilteredCourses: protectedProcedure
		.input(z.object({ filters: CourseFiltersSchema }))
		.query(async ({ input, ctx }) => {
			const { filters } = input;

			console.log(filters);
			try {
				const baseQuery = db
					.selectFrom('Course')
					.select(['id', 'code', 'name', 'level', 'credits'])
					.orderBy('code', filters.order);

				if (filters.level) {
					baseQuery.where('level', '=', filters.level);
				}
				if (filters.departmentId) {
					baseQuery.where('departmentId', '=', filters.departmentId);
				}
				if (filters.excludeCourseIds?.length) {
					baseQuery.where('id', 'not in', filters.excludeCourseIds);
				}

				// Execute queries in parallel
				const [courses, countResult] = await Promise.all([
					baseQuery.execute(),
					db
						.selectFrom('Course')
						.select(db.fn.countAll().as('count'))
						.$if(!!filters.level, (qb) => qb.where('level', '=', filters.level!))
						.$if(!!filters.departmentId, (qb) =>
							qb.where('departmentId', '=', filters.departmentId!)
						)
						.$if(!!filters.excludeCourseIds?.length, (qb) =>
							qb.where('id', 'not in', filters.excludeCourseIds!)
						)
						.executeTakeFirst()
				]);

				return {
					courses,
					count: countResult?.count ?? 0
				};
			} catch (err) {
				console.error('Error fetching filtered courses:', err);
				throw new Error('Failed to fetch courses');
			}
		})
});
