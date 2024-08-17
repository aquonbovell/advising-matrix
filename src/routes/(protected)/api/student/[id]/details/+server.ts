import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const { id } = params;
	if (!id) return new Response('Missing ID', { status: 400 });

	const studentProgram = await fetch(`/api/student/${id}/program`).then((r) => r.json());
	let programRequirements: {
		id: string;
		type: 'POOL' | 'CREDITS';
		level: number;
		credits: number;
		facultyPool: string[] | 'any' | null;
		courses: string[];
	}[] = [];
	for (const program of studentProgram) {
		if (program.type === 'CREDITS') {
			programRequirements = [
				...programRequirements,
				{
					id: program.id,
					type: program.type,
					level: program.level,
					credits: program.credits,
					facultyPool: program.details.facultyPool || null,
					courses: program.details.courses
				}
			];
		} else if (
			program.type === 'POOL' &&
			Array.isArray(program.details.facultyPool) &&
			Number.isNaN(+program.details.facultyPool.join(''))
		) {
			programRequirements = [
				...programRequirements,
				{
					id: program.id,
					type: program.type,
					level: program.level,
					credits: program.credits,
					facultyPool: program.details.facultyPool || null,
					courses: []
				}
			];
		} else {
			programRequirements = [
				...programRequirements,
				{
					id: program.id,
					type: program.type,
					level: program.level,
					credits: program.credits,
					facultyPool: program.details.facultyPool || null,
					courses: []
				}
			];
		}
	}
	const facultyPool = programRequirements.filter(
		(req) => Array.isArray(req.facultyPool) && Number.isNaN(+req.facultyPool.join(''))
	);
	const creditCourses = programRequirements
		.flatMap((r) => r.courses)
		.concat(
			programRequirements
				.filter((req) => Array.isArray(req.facultyPool) && !Number.isNaN(+req.facultyPool.join('')))
				.flatMap((r) => r.facultyPool!)
		);
	for (const pool of facultyPool) {
		let query = db.selectFrom('Course').select(['id', 'code']);
		if (pool.level === null) {
			query = query.where('Course.level', 'in', [2, 3]);
		} else {
			query = query.where('Course.level', '=', pool.level);
		}
		const data = await query.execute();
		const courses = data.filter(
			(course) =>
				pool.facultyPool!.includes(course.code.substring(0, 4)) &&
				!creditCourses.includes(course.id)
		);
		const index = programRequirements.indexOf(pool);
		if (index !== -1) {
			programRequirements[index]!.courses = courses.map((course) => course.id);
		}
	}

	const poolCourses = programRequirements.flatMap((r) => r.courses);

	const anyElectivesCourse = programRequirements.filter((req) => req.facultyPool === 'any');
	for (const pool of anyElectivesCourse) {
		let query = db.selectFrom('Course').select(['id', 'code']);
		if (pool.level === null) {
			query = query.where('Course.level', 'in', [2, 3]);
		} else {
			query = query.where('Course.level', '=', pool.level);
		}
		const data = await query.execute();
		const courses = data.filter(
			(course) => !creditCourses.includes(course.id) && !poolCourses.includes(course.id)
		);
		const index = programRequirements.indexOf(pool);
		if (index !== -1) {
			programRequirements[index]!.courses = courses.map((course) => course.id);
		}
	}

	const studentCreditCourses = programRequirements.filter((req) => req.type === 'CREDITS');
	let studentCreditCoursesCompleted: { code: string; credits: number }[] = [];
	for (const course of studentCreditCourses) {
		const query = await db
			.selectFrom('StudentCourse')
			.innerJoin('Course', 'StudentCourse.courseId', 'Course.id')
			.where('StudentCourse.studentId', '=', id)
			.selectAll()
			.execute();
		studentCreditCoursesCompleted = [
			...studentCreditCoursesCompleted,
			...query
				.filter((cc) => course.courses.includes(cc.courseId))
				.flatMap((cc) => {
					return { code: cc.code, credits: cc.credits };
				})
		];
	}
	const studentPoolCourses = programRequirements.filter((req) => req.type === 'POOL');
	for (const pool of studentPoolCourses) {
		const query = await db
			.selectFrom('StudentCourse')
			.innerJoin('Course', 'StudentCourse.courseId', 'Course.id')
			.where('StudentCourse.studentId', '=', id)
			.selectAll()
			.execute();
		let filter = pool.courses;
		if (Array.isArray(pool.facultyPool) && !Number.isNaN(+pool.facultyPool.join(''))) {
			filter = filter.concat(pool.facultyPool);
		}
		studentCreditCoursesCompleted = [
			...studentCreditCoursesCompleted,
			...query
				.filter((cc) => filter.includes(cc.courseId))
				.flatMap((cc) => {
					return { code: cc.code, credits: cc.credits };
				})
		];
	}
	return json({
		totalcredits: programRequirements.reduce((acc, { credits }) => acc + credits, 0),
		completedcredits: studentCreditCoursesCompleted.reduce((acc, { credits }) => acc + credits, 0),
		// TODO: Implement the following calculations for the foundation courses
		totalFoundationCredits: 9,
		foundationCredits: studentCreditCoursesCompleted
			.filter((cc) => cc.code[4] === '0')
			.reduce((acc, { credits }) => acc + credits, 0),
		totalLevelOneCredits: programRequirements
			.filter((req) => req.level === 1)
			.reduce((acc, { credits }) => acc + credits, 0),
		levelOne: studentCreditCoursesCompleted
			.filter((cc) => cc.code[4] === '1')
			.reduce((acc, { credits }) => acc + credits, 0),
		totalLevelTwoThreeCredits: programRequirements
			.filter((req) => req.level === 2 || req.level === 3 || req.level === null)
			.reduce((acc, { credits }) => acc + credits, 0),
		levelTwoThree: studentCreditCoursesCompleted
			.filter((cc) => cc.code[4] === '2' || cc.code[4] === '3')
			.reduce((acc, { credits }) => acc + credits, 0)
	});
};
