import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { paginateTable } from '$lib/utils';
import { count, paginate, fetchFilter, findByCode } from '$lib/actions/course.action';

const courseFiltersSchema = z.object({
	level: z.number().optional(),
	departmentId: z.string().optional(),
	excludeCourseIds: z.array(z.string()).optional(),
	order: z.enum(['asc', 'desc']).optional().default('asc')
});

// async function getPrerequisites(
// 	courseId: number,
// 	visited = new Set<number>()
// ): Promise<CourseWithPrerequisites | null> {
// 	if (visited.has(courseId)) return null;
// 	visited.add(courseId);

// 	const course = await db
// 		.selectFrom('Course')
// 		.where('Course.id', '=', courseId)
// 		.select(['id', 'code', 'name', 'level', 'credits', 'departmentId'])
// 		.executeTakeFirst();

// 	if (!course) return null;

// 	const prerequisites = await db
// 		.selectFrom('CoursePrerequisite')
// 		.innerJoin('Course', 'Course.id', 'CoursePrerequisite.prerequisiteId')
// 		.where('CoursePrerequisite.courseId', '=', courseId)
// 		.select([
// 			'Course.id',
// 			'Course.code',
// 			'Course.name',
// 			'Course.level',
// 			'Course.credits',
// 			'Course.departmentId'
// 		])
// 		.execute();

// 	const prereqsWithHierarchy = await Promise.all(
// 		prerequisites.map(async (prereq) => {
// 			return await getPrerequisites(prereq.id, new Set(visited));
// 		})
// 	);

// 	return {
// 		...course,
// 		prerequisites: prereqsWithHierarchy.filter((p): p is CourseWithPrerequisites => p !== null)
// 	};
// }

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
		})
});
