import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) return new Response('Missing ID', { status: 400 });

	const studentProgram = await db
		.selectFrom('Student')
		.innerJoin('ProgramRequirement', 'Student.program_id', 'ProgramRequirement.programId')
		.where('Student.id', '=', id)
		.selectAll()
		.execute();
	const credits = studentProgram.reduce((acc, { credits }) => acc + credits, 0);
	let creditCourseIds: string[] = [];
	creditCourseIds = [
		...creditCourseIds,
		...studentProgram.filter((r) => r.type === 'CREDITS').flatMap((r) => r.details.courses)
	];

	creditCourseIds = [
		...creditCourseIds,
		...studentProgram
			.filter(
				(r) =>
					r.type === 'POOL' &&
					Array.isArray(r.details.facultyPool) &&
					!Number.isNaN(+r.details.facultyPool.join(''))
			)
			.flatMap((r) => r.details.facultyPool)
	];

	const electivePool = studentProgram
		.filter(
			(r) =>
				r.type === 'POOL' &&
				Array.isArray(r.details.facultyPool) &&
				Number.isNaN(+r.details.facultyPool.join(''))
		)
		.flatMap((r) => {
			return {
				level: r.details.levelPool.map((level: string) =>
					level === 'I' ? 1 : level === 'II' ? 2 : 3
				),
				pool: r.details.facultyPool
			};
		});
	let electivePoolCourses: { id: string; code: string }[] = [];

	for (const pool of electivePool) {
		const query = await db
			.selectFrom('Course')
			.select(['id', 'code'])
			.where('level', 'in', pool.level)
			.execute();
		electivePoolCourses = [
			...electivePoolCourses,
			...query.flatMap((course) => {
				return { id: course.id, code: course.code };
			})
		];
	}
	const electiveCoursesIds = electivePoolCourses
		.filter((c) => electivePool.flatMap((p) => p.pool).includes(c.code.substring(0, 4)))
		.flatMap((c) => c.id);
	const anyElectives = studentProgram
		.filter(
			(r) =>
				r.type === 'POOL' &&
				typeof r.details.facultyPool === 'string' &&
				r.details.facultyPool === 'any'
		)
		.flatMap((r) => {
			return {
				level: r.details.levelPool.map((level: string) =>
					level === 'I' ? 1 : level === 'II' ? 2 : 3
				),
				pool: r.details.facultyPool
			};
		});
	let anyElectivesCourses: string[] = [];
	for (const pool of anyElectives) {
		const query = await db
			.selectFrom('Course')
			.select(['id'])
			.where('level', 'in', pool.level)
			.where('id', 'not in', creditCourseIds.concat(electiveCoursesIds))
			.execute();
		anyElectivesCourses = query.flatMap((course) => course.id);
	}
	const courses = await db
		.selectFrom('StudentCourse')
		.innerJoin('Course', 'StudentCourse.courseId', 'Course.id')
		.where('courseId', 'in', creditCourseIds.concat(electiveCoursesIds).concat(anyElectivesCourses))
		.select(['StudentCourse.courseId as courseId', 'Course.credits'])
		.execute();
	const completedCredits = courses.reduce((acc, { credits }) => acc + credits, 0);
	return json({ totalcredits: credits, completedcredits: completedCredits });
};
